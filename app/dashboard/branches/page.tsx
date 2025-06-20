'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Button, Drawer, Tooltip, Modal, Box, Input } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface Branch {
    id?: string;
    name: string;
    address: string;
    phone: string
}

const Branches = () => {
    const [open, setOpen] = useState<{ [key: string]: boolean }>({ right: false });
    const [branches, setBranches] = useState<Branch[]>([]);
    const [form, setForm] = useState<Branch>({ name: '', address: '', phone: ''});
    const [phoneError, setPhoneError] = useState<string>('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState<boolean>(false);

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        const snapshot = await getDocs(collection(db, 'branches'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Branch) }));
        setBranches(data);
    };

    const handleOpen = (direction: string, isOpen: boolean) => () => {
        setOpen(prev => ({ ...prev, [direction]: isOpen }));
    };

    const handleClose = (direction: string) => () => {
        setOpen(prev => ({ ...prev, [direction]: false }));
        setPhoneError('');
        setForm({ name: '', address: '', phone: ''});
        setEditingId(null);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const isValid = /^05\d{9}$/.test(value);
            if (!isValid) {
                setPhoneError('Telefon numarası 11 haneli ve 05 ile başlamalıdır.');
            } else {
                setPhoneError('');
            }
        }
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (phoneError || !/^05\d{9}$/.test(form.phone)) {
            setPhoneError('Telefon numarası 11 haneli ve 05 ile başlamalıdır.');
            return;
        }

        if (editingId) {
            const ref = doc(db, 'branches', editingId);
            await updateDoc(ref, { ...form });
        } else {
            await addDoc(collection(db, 'branches'), form);
        }

        setForm({ name: '', address: '', phone: ''});
        setOpen({ right: false });
        setPhoneError('');
        setEditingId(null);
        loadBranches();
    };

    const handleEdit = (branch: Branch) => {
        setForm(branch);
        setEditingId(branch.id || null);
        setOpen({ right: true });
    };

    const handleDelete = async (id?: string) => {
        if (id && confirm('Bu şubeyi silmek istediğinizden emin misiniz?')) {
            await deleteDoc(doc(db, 'branches', id));
            loadBranches();
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', flex: 1 },
        { field: 'name', headerName: 'Adı', flex: 1 },
        { field: 'address', headerName: 'Adresi', flex: 2 },
        { field: 'phone', headerName: 'Telefonu', flex: 1 },
        {
            field: 'actions',
            headerName: 'İşlemler',
            sortable: false,
            flex: 1,
            renderCell: (params) => (
                <div className='flex gap-2 mt-2'>
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
                            onClick={() => setOpenModal(true)}
                        >
                            Sil
                        </Button>
                    </Tooltip>


                    <Modal
                        open={openModal}
                        onClose={() => setOpenModal(false)}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <div className='text-lg font-semibold'>Şubeyi Sil</div>
                            <div className='my-7'>Bu şubeyi silmek istediğinizden emin misiniz?</div>
                            <Button color='primary' variant='outlined' onClick={() => setOpenModal(false)}>İptal</Button>
                            <span className='mx-2'></span>
                            <Button color='primary' variant='contained' onClick={() => handleDelete(params.row.id)}>Onaylıyorum</Button>
                        </Box>
                    </Modal>
                </div>
            )
        }
    ];

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <div className="bg-white rounded-2xl p-5 mt-5">
            <div className='flex justify-between items-center mb-5'>
                <h2 className='text-3xl font-bold text-black'>Şubeler</h2>
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
                    rows={branches.map(branch => ({ ...branch, id: branch.id || '' }))}
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
                sx={{ '& .MuiDrawer-paper': { width: 900, boxSizing: 'border-box' } }}
                anchor={'right'}
                open={open['right']}
                onClose={handleClose('right')}
                className="relative"
            >
                <div className='p-5'>
                    <h2 className='text-2xl font-bold'>{editingId ? 'Şube Güncelle' : 'Şube Ekle'}</h2>
                    <div className='mt-5'>
                        <Alert icon={false} severity="info" className='mb-5'>
                            <span className='text-xs text-red-500 font-semibold'>*</span> ile işaretli alanlar zorunludur.
                        </Alert>

                        <div className='flex flex-col gap-4 w-full max-w-lg'>
                            <div className='mb-5'>
                                <label className='text-sm font-semibold block mb-2'>Şube Adı *</label>
                                <Input type="text" name="name" value={form.name} onChange={handleChange} placeholder='Şube Adı' className='w-full h-10 border border-gray-300 rounded-md px-3 outline-0' />
                            </div>
                            <div className='mb-5'>
                                <label className='text-sm font-semibold block mb-2'>Adres *</label>
                                <textarea name="address" value={form.address} style={{ overflow: 'auto', resize: 'none', height: '100px' }} onChange={handleChange} placeholder='Adres' className='w-full h-30 border border-gray-300 rounded-md p-2.5 outline-0' />
                            </div>
                            <div className='mb-5'>
                                <label className='text-sm font-semibold block mb-2'>Telefon *</label>
                                <Input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder='Telefon Numarası' className='w-full h-10 border border-gray-300 rounded-md px-3 outline-0' />
                                {phoneError && <p className="text-red-600 text-sm mt-1">{phoneError}</p>}
                            </div>
                        </div>

                        <div className='flex justify-end items-center gap-5 mt-10'>
                            <Button startIcon={<CloseIcon />} variant='outlined' onClick={handleClose('right')}>KAPAT</Button>
                            <Button startIcon={editingId ? <AutorenewIcon /> : <AddIcon />} onClick={handleSubmit}
                                color='primary'
                                variant="contained"
                            >
                                {editingId ? 'GÜNCELLE' : 'EKLE'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
};

export default Branches;