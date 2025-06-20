'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';

interface MenuItemType {
  id?: string;
  title: string;
  url: string;
  iconName: string;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
      style={{ paddingTop: 16 }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);

  // --- Logo state ---
  const [logoUrl, setLogoUrl] = useState('');
  const [logoMsg, setLogoMsg] = useState('');

  // --- Site title state ---
  const [siteTitle, setSiteTitle] = useState('');
  const [titleMsg, setTitleMsg] = useState('');

  // --- Menu yönetimi state ---
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuItemType>({ title: '', url: '', iconName: '' });
  const [formMsg, setFormMsg] = useState('');

  // Load menu items from firestore
  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    const snapshot = await getDocs(collection(db, 'menu'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as MenuItemType) }));
    setMenuItems(data);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    clearMessages();
  };

  const clearMessages = () => {
    setLogoMsg('');
    setTitleMsg('');
    setFormMsg('');
  };

  // Logo handlers
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUrl(e.target.value);
  };
  const saveLogo = () => {
    // TODO: Kaydetme işlemi api/firebase vs
    setLogoMsg('Logo URL başarıyla kaydedildi.');
  };

  // Site title handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiteTitle(e.target.value);
  };
  const saveTitle = () => {
    // TODO: Kaydetme işlemi api/firebase vs
    setTitleMsg('Site başlığı başarıyla kaydedildi.');
  };

  // Menü form handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ title: '', url: '', iconName: '' });
    setEditingId(null);
    setFormMsg('');
  };

  const saveMenuItem = async () => {
    if (!form.title.trim() || !form.url.trim() || !form.iconName.trim()) {
      setFormMsg('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      if (editingId) {
        const ref = doc(db, 'menu', editingId);
        await updateDoc(ref, form);
        setFormMsg('Menü öğesi güncellendi.');
      } else {
        await addDoc(collection(db, 'menu'), form);
        setFormMsg('Menü öğesi eklendi.');
      }
      resetForm();
      loadMenuItems();
    } catch (error) {
      setFormMsg('Bir hata oluştu, tekrar deneyin.');
    }
  };

  const editMenuItem = (item: MenuItemType) => {
    setForm({ title: item.title, url: item.url, iconName: item.iconName });
    setEditingId(item.id || null);
    setFormMsg('');
    setTabValue(2); // Menü tabına otomatik geçiş
  };

  const deleteMenuItem = async (id?: string) => {
    if (!id) return;
    if (confirm('Bu menü öğesini silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'menu', id));
        loadMenuItems();
        if (editingId === id) resetForm();
      } catch {
        alert('Silme işlemi başarısız oldu.');
      }
    }
  };

  return (
    <Box maxWidth={720} mx="auto" mt={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Ayarlar</Typography>

      <Tabs value={tabValue} onChange={handleTabChange} aria-label="Settings Tabs" variant="fullWidth">
        <Tab label="Logo Güncelleme" />
        <Tab label="Site Başlığı" />
        <Tab label="Menü Yönetimi" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <TextField
          label="Logo URL"
          variant="outlined"
          fullWidth
          value={logoUrl}
          onChange={handleLogoChange}
          placeholder="Logo URL giriniz"
        />
        <Box mt={2}>
          <Button variant="contained" onClick={saveLogo}>Kaydet</Button>
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
        />
        <Box mt={2}>
          <Button variant="contained" onClick={saveTitle}>Kaydet</Button>
        </Box>
        {titleMsg && <Alert severity="success" sx={{ mt: 2 }}>{titleMsg}</Alert>}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box component="form" noValidate autoComplete="off" mb={2}>
          <TextField
            label="Başlık"
            name="title"
            variant="outlined"
            value={form.title}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="URL"
            name="url"
            variant="outlined"
            value={form.url}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Icon İsmi"
            name="iconName"
            variant="outlined"
            value={form.iconName}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            helperText="Material UI icon ismini yazınız (ör: HomeIcon)"
          />
          <Box mt={1} display="flex" gap={2}>
            <Button variant="contained" onClick={saveMenuItem} startIcon={<AddIcon />}>
              {editingId ? 'Güncelle' : 'Ekle'}
            </Button>
            {editingId && (
              <Button variant="outlined" color="secondary" onClick={resetForm}>
                İptal
              </Button>
            )}
          </Box>
          {formMsg && <Alert severity={formMsg.includes('hata') ? 'error' : 'success'} sx={{ mt: 2 }}>{formMsg}</Alert>}
        </Box>

        <Divider />

        <List>
          {menuItems.map(item => (
            <ListItem key={item.id} secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => editMenuItem(item)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => deleteMenuItem(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }>
              <ListItemText primary={item.title} secondary={`${item.url} — Icon: ${item.iconName}`} />
            </ListItem>
          ))}
        </List>
      </TabPanel>
    </Box>
  );
};

export default Settings;