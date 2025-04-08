import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import {styled} from "@mui/material/styles";

const icons = [
    'LocalShippingOutlined',
    'LocalOfferOutlined',
    'NewReleasesOutlined',
    'CardMembershipOutlined',
    'AssignmentReturnOutlined',
];

const colors = [
    '#4051B5',
    '#2E7D32',
    '#C2185B',
    '#F57C00',
    '#0097A7',
];

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.MuiTableCell-head': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
}));

const AdminPromotionalBanner = () => {
    const [banners, setBanners] = useState([
        {
            id: 1,
            title: "Fast Delivery!",
            subtitle: "Order now in New York,",
            highlight: "get it in 3 hours!",
            icon: "LocalShippingOutlined",
            backgroundColor: "#4051B5",
            active: true,
        },
        // Add more initial banners as needed
    ]);

    const [open, setOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        highlight: '',
        icon: '',
        backgroundColor: '',
        active: true,
    });

    const handleOpen = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData(banner);
        } else {
            setEditingBanner(null);
            setFormData({
                title: '',
                subtitle: '',
                highlight: '',
                icon: '',
                backgroundColor: '',
                active: true,
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingBanner(null);
    };

    const handleSubmit = () => {
        if (editingBanner) {
            setBanners(banners.map(banner =>
                banner.id === editingBanner.id ? { ...formData, id: banner.id } : banner
            ));
        } else {
            setBanners([...banners, { ...formData, id: Date.now() }]);
        }
        handleClose();
    };

    const handleDelete = (id) => {
        setBanners(banners.filter(banner => banner.id !== id));
    };

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    return (
        <Box sx={{ mt: -10 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h2">
                    Manage Promotional Banners
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Add New Banner
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Title</StyledTableCell>
                            <StyledTableCell>Subtitle</StyledTableCell>
                            <StyledTableCell>Highlight</StyledTableCell>
                            <StyledTableCell>Icon</StyledTableCell>
                            <StyledTableCell>Background Color</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {banners.map((banner) => (
                            <TableRow key={banner.id}>
                                <TableCell>{banner.title}</TableCell>
                                <TableCell>{banner.subtitle}</TableCell>
                                <TableCell>{banner.highlight}</TableCell>
                                <TableCell>{banner.icon}</TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            width: 50,
                                            height: 20,
                                            backgroundColor: banner.backgroundColor,
                                            borderRadius: 1,
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{banner.active ? 'Active' : 'Inactive'}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(banner)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(banner.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Subtitle"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Highlight"
                                name="highlight"
                                value={formData.highlight}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                select
                                label="Icon"
                                name="icon"
                                value={formData.icon}
                                onChange={handleChange}
                            >
                                {icons.map((icon) => (
                                    <MenuItem key={icon} value={icon}>
                                        {icon}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                select
                                label="Background Color"
                                name="backgroundColor"
                                value={formData.backgroundColor}
                                onChange={handleChange}
                            >
                                {colors.map((color) => (
                                    <MenuItem key={color} value={color}>
                                        <Box
                                            sx={{
                                                width: 50,
                                                height: 20,
                                                backgroundColor: color,
                                                borderRadius: 1,
                                            }}
                                        />
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingBanner ? 'Save Changes' : 'Add Banner'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminPromotionalBanner;