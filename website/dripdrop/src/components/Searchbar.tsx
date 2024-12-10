import { Box, Typography, MenuItem, ListItemIcon, Avatar, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';


interface SearchbarItemProps {
  profilePic: string;
  profileUsername: string;
  profileID: string;
  setShowSearchBar: (newValue: boolean) => void;
  onClick?: () => void;
}

interface User {
  username: string;
  email: string;
  id: string;
}

interface SearchbarProps {
  value: string;
  setValue: (newValue: string) => void;
  results: User[];
  setShowSearchBar: (newValue: boolean) => void;
}

const Searchbar: React.FC<SearchbarProps> = ({ value, setValue, results, setShowSearchBar }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '0px .5rem'
    }}>
      <Box
        sx={{
          height: '95vh',
          width: '30vw',
          border: '1px solid #dfdfdf',
          borderRadius: '10px'
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '10%'
        }}>
          <TextField id="outlined-basic" placeholder="Search..." variant="outlined" value={value} onChange={
            handleChange
          } sx={{
            width: '90%',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'gray', // Default border color
              },
              '&:hover fieldset': {
                borderColor: 'gray', // Keeps the same color on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: 'gray', // Keeps the same color when focused
                boxShadow: 'none',   // Removes shadow on focus
              },
            },
          }} />
        </Box>
        <Box>
          {
            results.length > 0 ? results.map((user) => {

                return <SearchbarItem profileUsername={user.username} profilePic="" profileID={user.id} key={uuidv4()} setShowSearchBar={setShowSearchBar}/>
              }) : <Typography sx={{
                width: '90%',
                marginLeft: '5%'
              }}>No results found</Typography>
          }
        </Box>
      </Box>
    </Box>
  );
};

const SearchbarItem: React.FC<SearchbarItemProps> = ({ profilePic, profileUsername, profileID, setShowSearchBar, onClick }) => {
  const linkProps = {
    uID: profileID,
  }

  const hideSearchBar = () => {
    setShowSearchBar(false);
  }

  return (
    <MenuItem
      component={Link}
      to="/Profile" // Link to the user's profile
      state={linkProps}
      onClick={hideSearchBar}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <ListItemIcon sx={{ minWidth: 'unset', marginRight: '1rem' }}>
        <Avatar sx={{ height: '2.5rem', width: '2.5rem' }} src={profilePic} />
      </ListItemIcon>
      <Box>
        <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, lineHeight: '1.5rem' }}>{profileUsername}</Typography>
      </Box>
    </MenuItem>
  );
};

export default Searchbar;
