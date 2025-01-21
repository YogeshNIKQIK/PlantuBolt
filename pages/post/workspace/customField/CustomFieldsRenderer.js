import React, { useEffect, useState } from "react";
import { Box, TextField, Select, MenuItem, Typography, Checkbox, ListItemText, Grid } from "@mui/material";
import axios from "axios";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const CustomFieldsRenderer = ({
  workspaceId,
  projectId,
  initialValues = {},
  onFieldValuesChange,
}) => {
  const [customFields, setCustomFields] = useState([]);
  const [fieldValues, setFieldValues] = useState(initialValues);

  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        const response = await axios.get(
          `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/custom-fields`
        );
        if (response.status === 200) {
          setCustomFields(response.data.customFields || []);
        } else {
          console.error("Failed to fetch custom fields:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching custom fields:", error);
      }
    };

    fetchCustomFields();
  }, [workspaceId, projectId]);

  useEffect(() => {
    setFieldValues(initialValues);
  }, [initialValues]);

  const handleFieldChange = (fieldId, value) => {
    const updatedValues = {
      ...fieldValues,
      [fieldId]: value,
    };
    setFieldValues(updatedValues);
    onFieldValuesChange(updatedValues);
  };

  const getValidDayjsDate = (dateValue) => {
    if (dateValue) {
      const parsedDate = dayjs(dateValue);
      return parsedDate.isValid() ? parsedDate : null;
    }
    return null;
  };

  const renderField = (field) => {
    const isDisabled = field.disable;
    switch (field.type) {
      case "Text":
        return (
          <TextField
            fullWidth
            disabled={isDisabled}
            size="small"
            value={fieldValues[field._id] || ""}
            onChange={(e) => handleFieldChange(field._id, e.target.value)}
          />
        );
      case "Number":
        return (
          <TextField
            type="number"
            disabled={isDisabled}
            size="small"
            fullWidth
            value={fieldValues[field._id] || ""}
            onChange={(e) => handleFieldChange(field._id, e.target.value)}
          />
        );
      case "Single-select":
        return (
          <Select
            fullWidth
            size="small"
            disabled={isDisabled}
            value={fieldValues[field._id] || ""}
            onChange={(e) => handleFieldChange(field._id, e.target.value)}
          >
            {field.options.map((option, idx) => (
              <MenuItem key={idx} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        );
      case "Multi-select":
        return (
          <Select
            fullWidth
            disabled={isDisabled}
            size="small"
            multiple
            value={fieldValues[field._id] || []}
            onChange={(e) => handleFieldChange(field._id, e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {field.options.map((option, idx) => (
              <MenuItem key={idx} value={option}>
                <Checkbox checked={fieldValues[field._id]?.includes(option)} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
        );
      case "Date":
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={getValidDayjsDate(fieldValues[field._id])}
              onChange={(newValue) =>
                handleFieldChange(field._id, newValue ? newValue.toISOString() : null)
              }
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              disabled={isDisabled}
            />
          </LocalizationProvider>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {customFields.map((field, index) => (
          <React.Fragment key={field._id}>
            {field.type === "Text" ? (
              <Grid item xs={12}>
                <Typography>{field.name}</Typography>
                {renderField(field)}
              </Grid>
            ) : (
              <Grid item xs={6}>
                <Typography>{field.name}</Typography>
                {renderField(field)}
              </Grid>
            )}
          </React.Fragment>
        ))}
      </Grid>
    </Box>
  );
};

export default CustomFieldsRenderer;

