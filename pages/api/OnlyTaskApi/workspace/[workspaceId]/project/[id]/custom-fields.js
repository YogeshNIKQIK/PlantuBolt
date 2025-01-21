// pages/api/project/[id]/custom-fields/[fieldId].js
import mongoose from "mongoose";
import dbConnect from "../../../../../../../lib/dbConnect"; // Import database connection utility
import Workspace from "../../../../../../../models/workSpace"; // Import Workspace model

export default async function handler(req, res) {
  const { method } = req; // Extract HTTP method (GET, POST, PUT, DELETE, etc.)
  const { workspaceId, id, fieldId } = req.query; // Extract workspace, project, and custom field IDs from query params
  console.log( req.query);

  // Connect to the database
  await dbConnect();

  switch (method) {
    case "GET": // Get all custom fields for a project
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res
            .status(404)
            .json({ success: false, message: "Workspace not found" });
        }

        const project = workspace.projects.id(id);
        if (!project) {
          return res
            .status(404)
            .json({ success: false, message: "Project not found in this workspace" });
        }

        res.status(200).json({ success: true, customFields: project.customFields || [] });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "POST": // Add a new custom field to a project
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res
            .status(404)
            .json({ success: false, message: "Workspace not found" });
        }

        const project = workspace.projects.id(id);
        if (!project) {
          return res
            .status(404)
            .json({ success: false, message: "Project not found in this workspace" });
        }

        const newField = {
          _id: new mongoose.Types.ObjectId(),
          ...req.body, // Pass the custom field data (e.g., name, type, options, etc.)
        };

        project.customFields.push(newField);
        await workspace.save(); // Save the updated workspace document

        res.status(201).json({ success: true, customField: newField });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "PUT": // Update an existing custom field
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res
            .status(404)
            .json({ success: false, message: "Workspace not found" });
        }

        const project = workspace.projects.id(id);
        if (!project) {
          return res
            .status(404)
            .json({ success: false, message: "Project not found in this workspace" });
        }

        const field = project.customFields.id(fieldId);
        if (!field) {
          return res
            .status(404)
            .json({ success: false, message: "Custom field not found" });
        }

        Object.assign(field, req.body); // Update the custom field with the new data
        await workspace.save(); // Save the updated workspace document

        res.status(200).json({ success: true, customField: field });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "DELETE": // Delete a custom field from a project
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res
            .status(404)
            .json({ success: false, message: "Workspace not found" });
        }

        const project = workspace.projects.id(id);
        if (!project) {
          return res
            .status(404)
            .json({ success: false, message: "Project not found in this workspace" });
        }

        const field = project.customFields.id(fieldId);
        if (!field) {
          return res
            .status(404)
            .json({ success: false, message: "Custom field not found" });
        }

        field.remove(); // Remove the custom field from the project
        await workspace.save(); // Save the updated workspace document

        res.status(200).json({ success: true, message: "Custom field deleted" });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
