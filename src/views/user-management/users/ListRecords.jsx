/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';

import {
  getAllUsers,
  getUserById,
  getApproverRoles,
  createUser,
  updateUser,
  deleteUserById,
  getAssignableRoles
} from '../../../services/auth/user-service';
import EditRecord from './EditRecord';
import CreateRecord from './CreateRecord';

import moment from 'moment';
import { Link } from 'react-router-dom';
import MuiTable from '../../../components/general_components/MuiTable';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import UserDetailsModal from './UserDetailsModal';
import { toast } from 'react-toastify';

import { Grid, Button, CircularProgress, Stack, Box } from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

function ListRecords({ loggedInUserData }) {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState({ id: null });

  const [showUserForm, setShowUserForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDetailShowModal, setUserDetailShowModal] = useState(false);
  const [userDetail, setUserDetail] = useState();

  const handleOpenuserDetailModal = (rowData) => {
    setUserDetail(rowData);
    setUserDetailShowModal(true);
  };

  const handleCloseuserDetailModal = () => {
    setUserDetailShowModal(false);
  };

  const handleShowEditForm = (item) => {
    setSelectedItem(item);
    setShowEditForm(true);
  };
  const handleCloseEditForm = () => {
    setSelectedItem({ id: null });
    setShowEditForm(false);
  };

  const handleShowUserForm = () => {
    setShowUserForm(true);
  };
  const handleCloseUserForm = () => {
    setShowUserForm(false);
  };

  const getListOfUsers = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    onSuccess: (data) => {
      console.log('list of all users : ', data);
    },
    onError: (error) => {
      console.log('The error is : ', error);
      error?.response?.data?.message
        ? toast.error(error?.response?.data?.message)
        : !error?.response
          ? toast.warning('Check Your Internet Connection Please')
          : toast.error('An Error Occured Please Contact Admin');
      setLoading(false);
    }
  });
  console.log('users list : ', getListOfUsers?.data?.data);

  const deleteUserMutation = useMutation({
    mutationFn: deleteUserById,
    onSuccess: (data) => {
      queryClient.resetQueries(['users']);
      setLoading(false);
      console.log('deleted user succesfully ooooo: ');
    },
    onError: (err) => {
      console.log('The error is : ', err);
      toast.error('An error occurred!');
      setLoading(false);
    }
  });

  // const handleDelete = async (event, id) => {
  //     console.log("users is xxxxx : ", id);
  //     var result = window.confirm("Are you sure you want to delete? ");
  //     if (result === true) {
  //         setLoading(true);
  //         deleteUserMutation.mutate(id);
  //     }
  // };

  const handleCloseUserDetailModal = () => setUserDetailShowModal(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  const handleDelete = (event, id) => {
    setDeleteUserId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteUserId !== null) {
      deleteUserMutation.mutate(deleteUserId);
      setDeleteDialogOpen(false);
      setDeleteUserId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteUserId(null);
  };

  let tableId = 0;

  const columns = [
    {
      title: '#',
      width: '5%',
      field: 'name',
      render: (rowData) => {
        tableId = rowData.tableData.id;
        tableId++;
        return <div>{rowData.tableData.id}</div>;
      }
    },
    {
      title: 'Name',
      field: 'name',
      render: (rowData) => (
        <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => handleOpenuserDetailModal(rowData)}>
          {rowData?.name}
        </span>
      )
    },
    { title: 'Email', field: 'email' },
    { title: 'Role', field: 'role' },
    { title: 'Vendor', field: 'vendors.vendor.name', render: (rowData) => rowData?.vendors?.vendor?.name || 'N/A' },
    {
      title: 'Status',
      field: 'status',
      render: (rowData) => <Typography color={rowData.status === 'active' ? 'success' : 'error'}>{rowData.status}</Typography>
    },
    { title: 'Last Login', field: 'lastlogin' },
    {
      title: 'Photo',
      field: 'photo_url',
      render: (rowData) =>
        rowData.photo_url ? (
          <img src={`${import.meta.env.VITE_APP_API_BASE_URL}${rowData.photo_url}`} alt={rowData.name} width="100" />
        ) : (
          'No Image'
        )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container>
        <Grid item xs={12}>
          <Box sx={{ height: '3rem', m: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {loggedInUserData?.permissions?.includes('create user') && (
              <Button onClick={handleShowUserForm} variant="contained" color="primary">
                Add user
              </Button>
            )}
          </Box>
          <MuiTable
            tableTitle="Users"
            tableData={getListOfUsers?.data?.data ?? []}
            tableColumns={columns}
            handleShowEditForm={handleShowEditForm}
            handleDelete={(e, item_id) => handleDelete(e, item_id)}
            showEdit={loggedInUserData?.permissions?.includes('update user')}
            showDelete={loggedInUserData?.permissions?.includes('delete user')}
            loading={loading || getListOfUsers.isLoading || getListOfUsers.status === 'loading'}
          />
          <UserDetailsModal user={userDetail} showModal={userDetailShowModal} handleCloseModal={handleCloseUserDetailModal} />
          <EditRecord
            rowData={selectedItem}
            show={showEditForm}
            onHide={handleCloseEditForm}
            onClose={handleCloseEditForm}
            loggedInUserData={loggedInUserData}
          />
          <CreateRecord
            show={showUserForm}
            onHide={handleCloseUserForm}
            onClose={handleCloseUserForm}
            loggedInUserData={loggedInUserData}
          />
        </Grid>
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ListRecords;
