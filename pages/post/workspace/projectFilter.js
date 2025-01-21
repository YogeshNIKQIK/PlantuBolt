import React, { useState } from 'react';
import { MenuItem, ListItemIcon, ListItemText, Menu } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import CheckIcon from '@mui/icons-material/Check';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const filterOptions = [
  { label: 'Status', icon: <AssignmentIcon /> },
  { label: 'Start Date', icon: <CalendarTodayIcon />, hasSubmenu: true },
  { label: 'Due Date', icon: <EventIcon />, hasSubmenu: true },
  { label: 'Priority', icon: <FlagIcon />, hasSubmenu: true },
  { label: 'Assignee', icon: <PersonIcon /> },
];

const priorityLevels = ['Urgent', 'Medium', 'Normal', 'Low'];

const FilterMenu = ({ 
  onClose, 
  onPrioritySelect, 
  onDateSelect,
  activePriority,
  activeStartDate,
  activeDueDate
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleClick = (event, option) => {
    if (option.hasSubmenu) {
      setAnchorEl(event.currentTarget);
      setSelectedOption(option.label);
    } else {
      onClose();
    }
  };

  const handleSubMenuClose = () => {
    setAnchorEl(null);
    setSelectedOption(null);
  };

  const handlePrioritySelect = (priority) => {
    onPrioritySelect(priority);
    handleSubMenuClose();
    onClose();
  };

  const handleDateSelect = (date) => {
    onDateSelect(selectedOption, date);
    handleSubMenuClose();
    onClose();
  };

  const renderSubmenuContent = () => {
    switch (selectedOption) {
      case 'Priority':
        return priorityLevels.map((priority) => (
          <MenuItem key={priority} onClick={() => handlePrioritySelect(priority)}>
            <ListItemIcon>
              {activePriority === priority && <CheckIcon />}
            </ListItemIcon>
            <ListItemText>{priority}</ListItemText>
          </MenuItem>
        ));
      case 'Start Date':
      case 'Due Date':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={selectedOption === 'Start Date' ? activeStartDate : activeDueDate}
              onChange={handleDateSelect}
              sx={{
                width: '320px',
                '& .MuiPickersDay-root': {
                  fontSize: '0.875rem',
                },
              }}
            />
          </LocalizationProvider>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {filterOptions.map((option) => (
        <MenuItem key={option.label} onClick={(e) => handleClick(e, option)}>
          <ListItemIcon>{option.icon}</ListItemIcon>
          <ListItemText>
            {option.label}
            {option.hasSubmenu && (
              option.label === 'Start Date' && activeStartDate ? 
                ` (${new Date(activeStartDate).toLocaleDateString()})` :
              option.label === 'Due Date' && activeDueDate ?
                ` (${new Date(activeDueDate).toLocaleDateString()})` :
              option.label === 'Priority' && activePriority ?
                ` (${activePriority})` : ''
            )}
          </ListItemText>
          {option.hasSubmenu && <ArrowRightIcon />}
        </MenuItem>
      ))}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSubMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            ...(selectedOption === 'Start Date' || selectedOption === 'Due Date' ? {
              '& .MuiList-root': {
                padding: 0,
              }
            } : {})
          }
        }}
      >
        {renderSubmenuContent()}
      </Menu>
    </>
  );
};

export default FilterMenu;

