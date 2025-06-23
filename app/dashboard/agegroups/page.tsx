'use client';

import React, { useEffect, useState } from 'react';
import { Button, Drawer, TextField, Alert, Tooltip } from '@mui/material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AutorenewIcon from '@mui/icons-material/Autorenew';

interface AgeGroup {
  id?: string;
  name: string;
  minAge: number;
  maxAge: number;
  description: string;
}

const AgeGroups = () => {
  const [open, setOpen] = useState(false);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [form, setForm] = useState<AgeGroup>({ name: '', minAge: 0, maxAge: 0, description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadAgeGroups();
  }, []);

  const loadAgeGroups = async () => {
    const snapshot = await getDocs(collection(db, 'ageGroups'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as AgeGroup) }));
    setAgeGroups(data);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ name: '', minAge: 0, maxAge: 0, description: '' });
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'name' ? value : Number(value) }));
  };

  const handleSubmit = async () => {
    if (!form.name || form.minAge < 0 || form.maxAge < form.minAge) return;

    if (editingId) {
      const ref = doc(db, 'ageGroups', editingId);
      await updateDoc(ref, { ...form });
    } else {
      await addDoc(collection(db, 'ageGroups'), form);
    }

    handleClose();
    loadAgeGroups();
  };

  const handleEdit = (item: AgeGroup) => {
    setForm(item);
    setEditingId(item.id || null);
    setOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (id && confirm('Bu yaş grubunu silmek istediğinizden emin misiniz?')) {
      await deleteDoc(doc(db, 'ageGroups', id));
      loadAgeGroups();
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Grup Adı', flex: 1 },
    { field: 'minAge', headerName: 'Minimum Yaş', flex: 1 },
    { field: 'maxAge', headerName: 'Maksimum Yaş', flex: 1 },
    { field: 'description', headerName: 'Açıklama', flex: 1 },
    {
      field: 'actions',
      headerName: 'İşlemler',
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <div className='flex gap-2'>
          <Tooltip title="Güncelle">
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={() => handleEdit(params.row)}
              startIcon={<EditIcon />}
            >
              Güncelle
            </Button>
          </Tooltip>
          <Tooltip title="Sil">
            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
              startIcon={<DeleteIcon />}
            >
              Sil
            </Button>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 mt-5">
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-3xl font-bold text-black'>Yaş Grupları</h2>
        <Button
          onClick={handleOpen}
          variant="contained"
          startIcon={<AddIcon />}
          className='bg-indigo-600 hover:bg-indigo-700 text-white'
        >
          Yeni Ekle
        </Button>
      </div>

      <div className='mt-10' style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={ageGroups.map(group => ({ ...group, id: group.id || '' }))}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
        />
      </div>

      <Drawer
        anchor={'right'}
        open={open}
        onClose={handleClose}
        sx={{ '& .MuiDrawer-paper': { width: 500 } }}
      >
        <div className='p-5'>
          <h2 className='text-xl font-bold mb-4'>{editingId ? 'Yaş Grubu Güncelle' : 'Yaş Grubu Ekle'}</h2>
          <Alert severity="info" className='mb-5'>* Tüm alanlar zorunludur.</Alert>
          <div className='flex flex-col gap-4'>
            <TextField label="Grup Adı" name="name" value={form.name} onChange={handleChange} fullWidth />
            <TextField type="number" label="Minimum Yaş" name="minAge" value={form.minAge} onChange={handleChange} fullWidth />
            <TextField type="number" label="Maksimum Yaş" name="maxAge" value={form.maxAge} onChange={handleChange} fullWidth />
            <TextField type="string" label="Açıklama" name="description" value={form.description} onChange={handleChange} fullWidth />
          </div>

          <div className='flex justify-end gap-4 mt-6'>
            <Button startIcon={<CloseIcon />} variant='outlined' onClick={handleClose}>Kapat</Button>
            <Button
              startIcon={editingId ? <AutorenewIcon /> : <AddIcon />} onClick={handleSubmit} variant="contained" color="primary"
            >
              {editingId ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default AgeGroups;