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
import Container from '@mui/material/Container'; // Import Container

const drawerWidth = 240;

export default function HomePage() {
    return (
        <>
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
                                <ListItemButton>
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
                <Container
                    component="main"
                    sx={{ flexGrow: 1, p: 3, mt: 8 }} // Use padding and margin to adjust position
                >
                    <Typography variant="h4" component="h1" gutterBottom>
                        Welcome to DripDrop
                    </Typography>
                    <Typography variant="body1">
                        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laborum id aspernatur possimus ipsam quis cupiditate minima sit. Fugit eum incidunt, totam, dolorum porro voluptates quis, fugiat quidem nostrum nam doloribus!
                    </Typography>
                    {/* Add more components or content here */}
                </Container>
            </Box>
        </>
    );
}
