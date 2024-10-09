// src/components/Sidebar.tsx
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import { Settings, AccountBox, Search } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar = () => {
    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="permanent"
            anchor="left"
        >
            <Divider />
            <Box
                component="img"
                src='/DripDrop.png'
                alt='logo placeholder'
                loading='lazy'
                sx={{ width: 40, height: 40, margin: '16px auto', display: 'block' }}
            />
            <List>
                {['Home', 'Search', 'Profile', 'Settings'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton component={Link} to={`/${text.toLowerCase()}`}>
                            <ListItemIcon>
                                {index === 0 && <HomeIcon />}
                                {index === 1 && <Search />}
                                {index === 2 && <AccountBox />}
                                {index === 3 && <Settings />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;
