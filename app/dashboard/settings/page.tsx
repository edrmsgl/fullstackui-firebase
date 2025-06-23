'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Alert,
  LinearProgress,
} from '@mui/material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from '@/app/firebaseConfig';

interface SiteSettingsType {
  logoUrl: string;
  siteTitle: string;
  metaKeywords: string;
}

const SettingsContext = createContext<SiteSettingsType | null>(null);

export const useSiteSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSiteSettings must be used within SettingsProvider');
  return context;
};

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other} style={{ paddingTop: 16 }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettingsType>({
    logoUrl: '',
    siteTitle: '',
    metaKeywords: '',
  });

  useEffect(() => {
    const loadSettings = async () => {
      const docRef = doc(db, 'siteSettings', 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as SiteSettingsType);
      }
    };
    loadSettings();
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
};

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logoMsg, setLogoMsg] = useState('');

  // Site title and meta
  const [siteTitle, setSiteTitle] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [titleMsg, setTitleMsg] = useState('');

  // Load current settings on mount
  useEffect(() => {
    const loadSiteSettings = async () => {
      const docRef = doc(db, 'siteSettings', 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettingsType;
        setLogoUrl(data.logoUrl || '');
        setSiteTitle(data.siteTitle || '');
        setMetaKeywords(data.metaKeywords || '');
      }
    };
    loadSiteSettings();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    clearMessages();
  };

  const clearMessages = () => {
    setLogoMsg('');
    setTitleMsg('');
  };

  // Logo upload handlers
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setUploadProgress(0);
      setLogoMsg('');
    }
  };

  const uploadLogo = () => {
    if (!logoFile) {
      setLogoMsg('Lütfen önce bir dosya seçin.');
      return;
    }

    const storageRef = ref(storage, `logos/${logoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, logoFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setLogoMsg('Yükleme sırasında hata oluştu.');
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setLogoUrl(downloadURL);
          setUploadProgress(0);
          setLogoMsg('Logo başarıyla yüklendi.');
          saveSiteSettings({ logoUrl: downloadURL, siteTitle, metaKeywords });
          setLogoFile(null);
        });
      }
    );
  };

  // Title & meta handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setSiteTitle(e.target.value);
  const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => setMetaKeywords(e.target.value);

  const saveTitleAndMeta = () => {
    saveSiteSettings({ logoUrl, siteTitle, metaKeywords });
    setTitleMsg('Site ayarları başarıyla kaydedildi.');
  };

  // Firestore update
  const saveSiteSettings = async (settings: SiteSettingsType) => {
    try {
      await setDoc(doc(db, 'siteSettings', 'main'), settings);
    } catch (error) {
      console.error('Site ayarları kaydedilirken hata:', error);
    }
  };

  return (

    <div className="bg-white rounded-2xl p-5 mt-5">
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-3xl font-bold text-black'>Ayarlar</h2>
      </div>

      <Tabs value={tabValue} onChange={handleTabChange} aria-label="Settings Tabs" variant="fullWidth">
        <Tab label="Logo Güncelleme" />
        <Tab label="Site Başlığı & Meta" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="subtitle1" mb={1}>Mevcut Logo:</Typography>
        {logoUrl && <img src={logoUrl} alt="Logo" style={{ maxWidth: 150, marginBottom: 10 }} />}
        <input type="file" accept="image/*" onChange={handleLogoSelect} />
        {uploadProgress > 0 && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2, mb: 2 }} />}
        <Box mt={2}>
          <Button variant="contained" onClick={uploadLogo} disabled={!logoFile}>
            Yükle
          </Button>
        </Box>
        {logoMsg && <Alert severity="success" sx={{ mt: 2 }}>{logoMsg}</Alert>}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TextField
          label="Site Başlığı"
          variant="outlined"
          fullWidth
          value={siteTitle}
          onChange={handleTitleChange}
          placeholder="Site başlığını giriniz"
          margin="normal"
        />
        <TextField
          label="Meta Keywords (virgülle ayırın)"
          variant="outlined"
          fullWidth
          value={metaKeywords}
          onChange={handleMetaChange}
          placeholder="örn: spor, fitness, yoga"
          margin="normal"
        />
        <Box mt={2}>
          <Button variant="contained" onClick={saveTitleAndMeta}>
            Kaydet
          </Button>
        </Box>
        {titleMsg && <Alert severity="success" sx={{ mt: 2 }}>{titleMsg}</Alert>}
      </TabPanel>

    </div>
  );
};

export { SettingsProvider };
export default Settings;