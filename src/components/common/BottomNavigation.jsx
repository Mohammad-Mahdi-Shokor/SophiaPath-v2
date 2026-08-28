import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import { useTheme } from '@mui/material/styles';

const AppBottomNavigation = () => {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        backgroundColor: theme.palette.background.paper,
        borderTop: theme.palette.mode === 'light' ? '1px solid rgba(31, 31, 57, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)'
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{
          backgroundColor: 'transparent',
          '& .Mui-selected': {
            '& .MuiBottomNavigationAction-label': {
              color: theme.palette.primary.main},
            '& .MuiSvgIcon-root': {
              color: theme.palette.primary.main}}}}
      >
        <BottomNavigationAction
          label="Home"
          icon={<HomeIcon />}
          sx={{
            color: theme.palette.mode === 'light' ? 'rgba(31, 31, 57, 0.6)' : 'rgba(255, 255, 255, 0.6)'}}
        />
        <BottomNavigationAction
          label="Search"
          icon={<SearchIcon />}
          sx={{
            color: theme.palette.mode === 'light' ? 'rgba(31, 31, 57, 0.6)' : 'rgba(255, 255, 255, 0.6)'}}
        />
        <BottomNavigationAction
          label="Favorites"
          icon={<FavoriteIcon />}
          sx={{
            color: theme.palette.mode === 'light' ? 'rgba(31, 31, 57, 0.6)' : 'rgba(255, 255, 255, 0.6)'}}
        />
        <BottomNavigationAction
          label="Profile"
          icon={<PersonIcon />}
          sx={{
            color: theme.palette.mode === 'light' ? 'rgba(31, 31, 57, 0.6)' : 'rgba(255, 255, 255, 0.6)'}}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default AppBottomNavigation;