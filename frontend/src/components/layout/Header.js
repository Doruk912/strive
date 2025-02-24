import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Badge,
    Box,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';

const Header = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, cursor: 'pointer' }}
                >
                    Sports Store
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button color="inherit">Sports</Button>
                    <Button color="inherit">Equipment</Button>
                    <Button color="inherit">Clothing</Button>

                    <IconButton color="inherit">
                        <Badge badgeContent={0} color="error">
                            <ShoppingCartIcon />
                        </Badge>
                    </IconButton>

                    <IconButton color="inherit">
                        <PersonIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;