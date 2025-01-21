import { useState, useEffect } from "react";
import { Modal, Box, Button, Typography, List, ListItem, ListItemText, IconButton, InputBase } from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import Lottie from "lottie-react";
import nothingHere from '../../../../styles/nothingHereAnimation.json';
import loading2Animation from '../../../../styles/loading2Animation.json';
import AddFieldModal from "./customFieldForm";

const CustomFieldList = ({ workspaceId, projectId }) => {
  const [open, setOpen] = useState(false);
  const [customFields, setCustomFields] = useState([]); // State for custom fields
  const [loading, setLoading] = useState(false); // State for loading
  const [error, setError] = useState(null); // State for errors
  const [selectedField, setSelectedField] = useState(null); // State for the field being edited
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false); 

  // Fetch custom fields from the API
  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/custom-fields`, {
        method: "GET",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch custom fields");
      }
      setCustomFields(result.customFields || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch custom fields on component mount or when workspaceId/projectId changes
  useEffect(() => {
    if (workspaceId && projectId) {
      fetchCustomFields();
    }
  }, [workspaceId, projectId]);

  // Handle field creation
  const handleCreate = (fieldData) => {
    console.log("Created Field:", fieldData);
    fetchCustomFields();
    setOpen(false);
    setSelectedField(null); // Clear selected field after creation
  };

  // Handle field update
  const handleUpdate = (fieldData) => {
    console.log("Updated Field:", fieldData);
    fetchCustomFields();
    setOpen(false);
    setSelectedField(null); // Clear selected field after update
  };

  // Handle field deletion
  const handleDelete = async (fieldId) => {
    try {
      const response = await fetch(`/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/customField/${fieldId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to delete custom field");
      }
      // After successful deletion, refetch the custom fields
      fetchCustomFields();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Open modal for creating a new field
  const handleAddField = () => {
    setSelectedField(null); // Clear selected field
    setOpen(true); // Open the modal
  };

  // Open modal for editing a field
  const handleEditField = (field) => {
    setSelectedField(field); // Set the field to edit
    setOpen(true); // Open the modal
  };

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter custom fields based on search query
  const filteredCustomFields = customFields.filter((field) =>
    field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Header and Add Field Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        {/* <Typography variant="h6">Custom Fields</Typography> */}
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddField} sx={{
          borderColor: 'gray', // Border color gray
          color: 'gray', // Text color gray
          '&:hover': {
            borderColor: '#888', // Darker gray for hover
            backgroundColor: '#f5f5f5', // Light gray background on hover
          },
        }}
        >
          Add Field
        </Button>

       {/* Search Icon Button */}
       <IconButton onClick={() => setShowSearch(!showSearch)} color="primary" sx={{ marginLeft: 'auto' }}>
          <SearchIcon />
        </IconButton>

        {/* Conditionally Render the Search Field */}
      {showSearch && (
        // <Box sx={{ mb: 2 }}>
          <InputBase
              label="Search Custom Fields"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                marginLeft: 1,
                width: 200,
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: 2,
            }}
            />
        // </Box>
      )}
      </Box>

      

      {/* List of Custom Fields */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Lottie
          animationData={loading2Animation}  // Replace with your loading animation JSON file
          loop={true}
          style={{width: 200, height: 200 }}  // Adjust the size of the loading animation
        />
      </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : filteredCustomFields.length === 0 ? (
        // Show Lottie animation and message when no custom fields are available
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Lottie
            animationData={nothingHere}
            loop={true}
            style={{ width: 300, height: 300, mb: 30 }}
          />
          <Typography variant="h6" sx={{ marginTop: 2, color: 'gray' }}>
            Nothing Here
          </Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflowY: "auto", overflowX: "hidden", }}>
          {filteredCustomFields.map((field) => (
            <ListItem
              key={field._id}
              divider
              button
              onClick={() => handleEditField(field)} // Open in edit mode
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative", // Needed to position the delete icon
                width: "100%", // Ensures ListItem doesn't overflow horizontally
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.1)", // Highlight background on hover
                },
              }}
            >
              <ListItemText
                primary={field.name}
                secondary={`Type: ${field.type} | Required: ${field.required ? "Yes" : "No"}`}
                sx={{
                  whiteSpace: "nowrap", // Prevent text wrapping
                  overflow: "hidden", // Hide overflowed content
                  textOverflow: "ellipsis", // Display ellipsis for overflowed text
                }}
              />
              {/* Delete Icon */}
              <IconButton edge="end" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(field._id); }} sx={{
                opacity: 0, // Initially hidden
                position: "absolute", // Position delete icon in the top right
                top: "50%",
                right: 10,
                transform: "translateY(-50%)",
                transition: "opacity 0.3s ease", // Smooth transition
                "&:hover": {
                  opacity: 1, // Show on hover of the icon itself
                },
                parent: {
                  "&:hover": {
                    opacity: 1, // Show on hover of the parent ListItem
                  }
                }
              }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Add or Edit Field Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <AddFieldModal
            projectId={projectId}
            workspaceId={workspaceId}
            onCancel={() => setOpen(false)}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            editField={selectedField} // Pass the selected field to edit
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default CustomFieldList;
