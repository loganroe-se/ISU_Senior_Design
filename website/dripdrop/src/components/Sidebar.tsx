
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import { Settings, AccountBox, Search, AddBox } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import ListHeader from '@mui/material/ListSubheader'
import { Typography } from '@mui/material';
import Filter from '../components/Filters'

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
            <List>
                <ListHeader>
                    <Typography variant="h1" fontSize={"2rem"}>
                        TEST DEPLOY FROM PIPELINE
                    </Typography>
                </ListHeader>
                {['Home', 'Search', 'Post', 'Profile', 'Settings'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton component={Link} to={`/${text.toLowerCase()}`}>
                            <ListItemIcon>
                                {index === 0 && <HomeIcon />}
                                {index === 1 && <Search />}
                                {index === 2 && <AddBox/>}
                                {index === 3 && <AccountBox />}
                                {index === 4 && <Settings />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Filter />
        </Drawer>
    );
};

export default Sidebar;
