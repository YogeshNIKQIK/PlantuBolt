import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button, Grid,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import ListAltIcon from "@mui/icons-material/ListAlt";
import TextFormatOutlinedIcon from '@mui/icons-material/TextFormatOutlined';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NumbersIcon from "@mui/icons-material/Numbers";

const AddFieldModal = ({
  workspaceName = "Sapna",
  workspaceId,
  projectId,
  onCancel,
  onCreate,
  onUpdate,
  editField = null, // Pass the field to edit or null for creation
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("Single-select");
  const [options, setOptions] = useState(["", ""]);
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [required, setRequired] = useState(false);
  const [disable, setDisable] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log(editField);
  // Icons Mapping
  const typeIcons = {
    "Single-select": <ExpandCircleDownOutlinedIcon />,
    "Multi-select": <CheckBoxOutlinedIcon />,
    Text: <TextFormatOutlinedIcon />,
    Number: <NumbersIcon />,
    Date: <CalendarTodayIcon />,
    Checklist: <ListAltIcon />,
  };

  // Populate form with editField data if in edit mode
  useEffect(() => {
    if (editField) {
      setName(editField.name || "");
      setType(editField.type || "Single-select");
      setOptions(editField.options || [""]);
      setDescription(editField.description || "");
      setShowDescription(!!editField.description);
      setRequired(!!editField.required);
      setDisable(!!editField.disable);
    }
  }, [editField]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    const customFieldData = {
      name,
      type,
      options: options.filter((opt) => opt.trim() !== ""),
      description: showDescription ? description : null,
      required,
      disable,
    };

    try {
      setLoading(true);

      if (editField) {
        // Update existing custom field
        const response = await fetch(
          `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/customField/${editField._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(customFieldData),
          }
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to update custom field");

        console.log("Custom field updated:", result);
        onUpdate(result); // Notify parent component about the update
      } else {
        // Create new custom field
        const response = await fetch(
          `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/custom-fields`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(customFieldData),
          }
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to create custom field");

        console.log("Custom field created:", result);
        onCreate(result); // Notify parent component about the creation
      }
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, width: 500, bgcolor: "background.paper", borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {editField ? "Update Field" : "Add Field"}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        This field will be {editField ? "updated in" : "added to"} the <b> project's task.</b>
      </Typography>

      {/* Field Title */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            label="Field title *"
            size="small"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="Priority, Stage, Status..."
          />
        </Grid>


        {/* Field Type */}
        <Grid item xs={6}>
          <Select
            fullWidth
            size="small"
            value={type}
            onChange={(e) => setType(e.target.value)}
            sx={{ mb: 2 }}
            displayEmpty
            renderValue={(selected) => (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {typeIcons[selected]}
                <Typography sx={{ ml: 1 }}>{selected}</Typography>
              </Box>
            )}
          >
            {Object.keys(typeIcons).map((key) => (
              <MenuItem key={key} value={key} sx={{ display: "flex", alignItems: "center" }}>
                {typeIcons[key]}
                <Typography sx={{ ml: 1 }}>{key}</Typography>
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      {/* Add Description */}
      {!showDescription ? (
        <Button
          size="small"
          onClick={() => setShowDescription(true)}
          sx={{ mb: 1, textTransform: "none" }}
        >
          + Add description
        </Button>
      ) : (
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
      )}

      {/* Options for Dropdown or Checklist */}
      <Box sx={{ maxHeight: 300, overflowY: "auto", mb: 2 }}>
        {(type === "Single-select" || type === "Checklist" || type === "Multi-select") && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Options *
            </Typography>
            {options.map((option, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <TextField
                  placeholder="Type an option name"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  fullWidth
                  sx={{ mr: 1 }}
                />
                <IconButton
                  color="error"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 1}
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              size="small"
              onClick={addOption}
              startIcon={<AddIcon />}
              sx={{ textTransform: "none" }}
            >
              Add an option
            </Button>
          </Box>
        )}
      </Box>

       {/* Disable Toggle */}
       <FormControlLabel
        control={
          <Switch
            checked={disable}
            onChange={(e) => setDisable(e.target.checked)} // Update disable state
          />
        }
        label="Disable"
        sx={{ mb: 2 }}
      />

      {/* Required Toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
          />
        }
        label="Required"
        sx={{ mb: 2 }}
      />

      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={onCancel} sx={{ mr: 2 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!name || loading}
        >
          {loading ? (editField ? "Updating..." : "Creating...") : editField ? "Update Field" : "Create Field"}
        </Button>
      </Box>
    </Box>
  );
};

export default AddFieldModal;
