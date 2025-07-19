'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Alert, Button, Drawer, Tooltip, Modal, Box, Input, Chip, Select, MenuItem, OutlinedInput, Avatar, Typography, LinearProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Image from 'next/image';

interface Instructor {
    id?: string;
    name: string;
    specialties: string[];
    branchName: string;
    profileImage: string;
}

interface Branch {
    id: string;
    name: string;
}

const Instructors = () => {
    const [open, setOpen] = useState<{ [key: string]: boolean }>({ right: false });
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [form, setForm] = useState<Instructor>({ name: '', specialties: [], branchName: '', profileImage: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadInstructors();
        loadBranches();
    }, []);

    const loadInstructors = async () => {
            const q = query(collection(db, 'instructors'), orderBy('name'));
            const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Instructor) }));
        setInstructors(data);
    };

    const loadBranches = async () => {
        const snapshot = await getDocs(collection(db, 'branches'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setBranches(data);
    };

    const handleOpen = (direction: string, isOpen: boolean) => () => {
        setOpen(prev => ({ ...prev, [direction]: isOpen }));
    };

    const handleClose = (direction: string) => () => {
        setOpen(prev => ({ ...prev, [direction]: false }));
        setForm({ name: '', specialties: [], branchName: '', profileImage: '' });
        setEditingId(null);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
    ) => {
        const { name, value } = e.target;
        if (typeof name === 'string') {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, profileImage: reader.result as string }));
                setUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearProfileImage = () => {
        setForm(prev => ({ ...prev, profileImage: '' }));
    };

    const handleSpecialtiesChange = (event: any) => {
        const { value } = event.target;
        setForm(prev => ({ ...prev, specialties: typeof value === 'string' ? value.split(',') : value }));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.branchName || !form.profileImage || !form.specialties) return;

        if (editingId) {
            const ref = doc(db, 'instructors', editingId);
            await updateDoc(ref, { ...form });
        } else {
            await addDoc(collection(db, 'instructors'), form);
        }

        setForm({ name: '', specialties: [], branchName: '', profileImage: '' });
        setOpen({ right: false });
        setEditingId(null);
        loadInstructors();
    };

    const handleEdit = (instructor: Instructor) => {
        setForm(instructor);
        setEditingId(instructor.id || null);
        setOpen({ right: true });
    };

    const handleDelete = async (id?: string) => {
        if (id && confirm('Bu eğitmeni silmek istediğinizden emin misiniz?')) {
            await deleteDoc(doc(db, 'instructors', id));
            loadInstructors();
        }
    };
    
    const columns: GridColDef[] = [
        { field: 'profileImage', headerName: 'Profil Resmi', flex: 1, renderCell: (params) => (
            <Image src={params.value} alt={params.row.name} width={40} height={40} className='rounded-full' />
        ) },
        { field: 'name', headerName: 'Adı', flex: 1 },
        { field: 'specialties', headerName: 'Branşlar', flex: 2, renderCell: (params) => params.value.join(', ') },
        { field: 'branchName', headerName: 'Şube Adı', flex: 1 },
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
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(params.row)}
                        >
                            Güncelle
                        </Button>
                    </Tooltip>
                    <Tooltip title="Sil">
                        <Button
                            variant="contained"
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(params.row.id)}
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
                <h2 className='text-3xl font-bold text-black'>Eğitmenler</h2>
                <div className='flex gap-3.5'>
                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        className='text-sm font-semibold border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-all duration-300'
                    >
                        Filtrele
                    </Button>
                    <Button
                        onClick={handleOpen('right', true)}
                        variant="contained"
                        startIcon={<AddIcon />}
                        className='text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white'
                    >
                        Yeni Ekle
                    </Button>
                </div>
            </div>

            <div className='mt-10' style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={instructors.map(instructor => ({ ...instructor, id: instructor.id || '' }))}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 5 } }
                    }}
                    pageSizeOptions={[5]}
                    disableRowSelectionOnClick
                    getRowId={(row) => row.id || ''}
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

            <Drawer
                sx={{ '& .MuiDrawer-paper': { width: 500, boxSizing: 'border-box' } }}
                anchor={'right'}
                open={open['right']}
                onClose={handleClose('right')}
                className="relative"
            >
                <div className='p-5'>
                    <h2 className='text-2xl font-bold'>{editingId ? 'Eğitmen Güncelle' : 'Eğitmen Ekle'}</h2>
                    <div className='mt-5'>
                        <Alert icon={false} severity="info" className='mb-5'>
                            <span className='text-xs text-red-500 font-semibold'>*</span> ile işaretli alanlar zorunludur.
                        </Alert>

                        <div className='flex flex-col gap-4 w-full max-w-lg'>
                            <div className='mb-5'>
                                <label className='text-sm font-semibold block mb-2'>Adı *</label>
                                <Input type="text" name="name" value={form.name} onChange={handleChange} placeholder='Adı' className='w-full h-10 border border-gray-300 rounded-md px-3 outline-0' />
                            </div>
                            <div className='mb-5'>
                                <label className='text-sm font-semibold block mb-2'>Branşlar *</label>
                                <Select
                                    size='small'
                                    multiple
                                    displayEmpty
                                    value={form.specialties}
                                    onChange={handleSpecialtiesChange}
                                    input={<OutlinedInput label="Branşlar" />}
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                            return <em>Seçiniz</em>;
                                        }
                                        return (selected as string[]).join(', ');
                                    }}
                                    className='w-full'
                                >
                                    <MenuItem disabled value="">
                                        <em>Seçiniz</em>
                                    </MenuItem>
                                    <MenuItem value="Yüzme">Yüzme</MenuItem>
                                    <MenuItem value="Futbol">Futbol</MenuItem>
                                    <MenuItem value="Basketbol">Basketbol</MenuItem>
                                    <MenuItem value="Voleybol">Voleybol</MenuItem>
                                    <MenuItem value="Fitness">Fitness</MenuItem>
                                    <MenuItem value="Yoga">Yoga</MenuItem>
                                    <MenuItem value="Pilates">Pilates</MenuItem>
                                </Select>
                            </div>
                            <div className='mb-5'>
                                <label className='text-sm font-semibold block mb-2'>Şube *</label>
                                <Select
                                    displayEmpty
                                    size='small'
                                    name="branchName"
                                    value={form.branchName}
                                    onChange={handleChange}
                                    className='w-full'
                                >
                                    <MenuItem disabled value="">
                                        <em>Seçiniz</em>
                                    </MenuItem>
                                    {branches.map(branch => (
                                        <MenuItem key={branch.id} value={branch.name}>{branch.name}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <div className='mb-5'>
                                <label className='text-sm font-semibold block mb-2'>Profil Görseli</label>
                                <div className='flex items-center gap-3'>
                                    <Tooltip title="Fotoğraf yüklemek için tıklayın">
                                        <Avatar
                                            src={form.profileImage || ''}
                                            sx={{ width: 60, height: 60, cursor: 'pointer' }}
                                            onClick={() => fileInputRef.current?.click()}
                                        />
                                    </Tooltip>
                                    <div>
                                        {uploading ? <LinearProgress sx={{ width: 200 }} /> : (
                                            <>
                                                <Typography variant="body2" color="text.secondary">
                                                    {form.profileImage ? 'Yüklendi' : 'Dosya seçilmedi'}
                                                </Typography>
                                                {form.profileImage && (
                                                    <div className='flex gap-2 mt-1'>
                                                        <Button size="small" variant="outlined" onClick={() => fileInputRef.current?.click()}>
                                                            Güncelle
                                                        </Button>
                                                        <Button size="small" variant="outlined" color="error" onClick={clearProfileImage}>
                                                            Sil
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-end items-center gap-5 mt-10'>
                            <Button startIcon={<CloseIcon />} variant='outlined' onClick={handleClose('right')}>KAPAT</Button>
                            <Button startIcon={editingId ? <AutorenewIcon /> : <AddIcon />} onClick={handleSubmit} color='primary' variant="contained">
                                {editingId ? 'GÜNCELLE' : 'EKLE'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
};

export default Instructors;
