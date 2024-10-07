import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import { Settings, AccountBox, Search } from '@mui/icons-material';
import Container from '@mui/material/Container'; 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Profile from './Profile';
import SettingsPage from './Settings';
import SearchResults from './SearchResults';

const drawerWidth = 240;

export default function Home() {
    return (
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
                >
                    <Toolbar>
                        <Typography variant="h6" noWrap component="div">
                            DripDrop
                        </Typography>
                    </Toolbar>
                </AppBar>
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
                        src='/logo512.png'
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

                {/* Main content area */}
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    Home Page
                </Typography>
                <Typography variant="body1">
                    This is the home page
                </Typography>
            </Box>
                <Container
                    component="main"
                    sx={{ flexGrow: 1, p: 3, mt: 8 }} // Adjust padding and margin to position content properly
                >
                    <Routes>
                        <Route path="/home" element={<Home />} />
                    <Route path="/search" element={<SearchResults />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </Container>
            </Box>

    );
}

