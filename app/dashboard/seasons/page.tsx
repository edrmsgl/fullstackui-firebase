'use client';

import React, { useEffect, useState } from 'react';
import { Button, Drawer, Input, Alert, Tooltip, Modal, Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface Season {
    id?: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

const Seasons = () => {
    const [open, setOpen] = useState(false);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [form, setForm] = useState<Season>({ name: '', startDate: '', endDate: '', isActive: false });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        loadSeasons();
    }, []);

    const loadSeasons = async () => {
        const q = query(collection(db, 'seasons'), orderBy('startDate', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Season) }));
        setSeasons(data);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setForm({ name: '', startDate: '', endDate: '', isActive: false });
        setEditingId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setForm(prev => ({ ...prev, [name]: checked }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };


    const isCurrentlyActive = (start: string, end: string) => {
  const now = new Date();

  // startDate'ye saat olarak 00:00:00 ekle
  const startDate = new Date(start + 'T00:00:00');

  // endDate'ye saat olarak 23:59:59 ekle
  const endDate = new Date(end + 'T23:59:59');

  return now >= startDate && now <= endDate;
};


    const handleSubmit = async () => {
        if (!form.name || !form.startDate || !form.endDate) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }
        if (new Date(form.endDate) < new Date(form.startDate)) {
            alert('Bitiş tarihi başlangıç tarihinden küçük olamaz.');
            return;
        }

        const seasonData = {
            name: form.name,
            startDate: form.startDate,
            endDate: form.endDate,
            isActive: isCurrentlyActive(form.startDate, form.endDate)
        };

        if (editingId) {
            const ref = doc(db, 'seasons', editingId);
            await updateDoc(ref, seasonData);
        } else {
            await addDoc(collection(db, 'seasons'), seasonData);
        }
        handleClose();
        loadSeasons();
    };


    const handleEdit = (season: Season) => {
        setForm(season);
        setEditingId(season.id || null);
        setOpen(true);
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        await deleteDoc(doc(db, 'seasons', id));
        setOpenModal(false);
        loadSeasons();
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Sezon Adı', flex: 1 },
        {
            field: 'startDate',
            headerName: 'Başlangıç Tarihi',
            flex: 1
        },
        {
            field: 'endDate',
            headerName: 'Bitiş Tarihi',
            flex: 1
        },
        {
            field: 'status',
            headerName: 'Durum',
            flex: 1,
            renderCell: (params) => {
                const isActive = isCurrentlyActive(params.row.startDate, params.row.endDate);
                return (
                    <span className={isActive ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {isActive ? 'Aktif' : 'Pasif'}
                    </span>
                );
            },

            cellClassName: (params: any) => {
                const val = params.value;
                return val === 'Aktif' ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
            },
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                <div className="flex gap-2">
                    <Tooltip title="Düzenle">
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(params.row)}
                        >
                            Düzenle
                        </Button>
                    </Tooltip>
                    <Tooltip title="Sil">
                        <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                                setDeleteId(params.row.id);
                                setOpenModal(true);
                            }}
                        >
                            Sil
                        </Button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    const style = {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 24,
        p: 4,
    };

    return (
        <div className="bg-white rounded-2xl p-5 mt-5">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-bold text-black">Sezonlar</h2>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    Yeni Sezon Ekle
                </Button>
            </div>

            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={seasons.map(s => ({ ...s, id: s.id || '' }))}
                    columns={columns}
                    pageSizeOptions={[5, 10, 20]}
                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                    disableRowSelectionOnClick
                    getRowId={row => row.id}
                     sx={{
                        '& .MuiDataGrid-columnHeaderTitle': {
                            outline: 'none !important',
                            fontWeight: 'bold !important',
                            fontSize: '14px',
                        },
                        '& .MuiDataGrid-cell': {
                            outline: 'none !important',
                        }
                    }}
                />
            </div>

            {/* Drawer form */}
            <Drawer
                anchor="right"
                open={open}
                onClose={handleClose}
                sx={{ '& .MuiDrawer-paper': { width: 450, padding: 3 } }}
            >
                <Typography variant="h6" mb={2}>
                    {editingId ? 'Sezon Güncelle' : 'Yeni Sezon Ekle'}
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                    * Tüm alanlar zorunludur.
                </Alert>

                <Input
                    name="name"
                    placeholder="Sezon Adı"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <Input
                    type="date"
                    name="startDate"
                    placeholder="Başlangıç Tarihi"
                    value={form.startDate}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <Input
                    type="date"
                    name="endDate"
                    placeholder="Bitiş Tarihi"
                    value={form.endDate}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                    <Button
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        onClick={handleClose}
                    >
                        Kapat
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={editingId ? <AutorenewIcon /> : <AddIcon />}
                        onClick={handleSubmit}
                    >
                        {editingId ? 'Güncelle' : 'Ekle'}
                    </Button>
                </div>
            </Drawer>

            {/* Silme Onayı Modal */}
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-title" variant="h6" component="h2" mb={2}>
                        Sezonu Sil
                    </Typography>
                    <Typography id="modal-description" sx={{ mb: 3 }}>
                        Bu sezonu silmek istediğinize emin misiniz?
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <Button variant="outlined" onClick={() => setOpenModal(false)}>
                            İptal
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                if (deleteId) {
                                    handleDelete(deleteId);
                                }
                            }}
                        >
                            Onaylıyorum
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default Seasons;