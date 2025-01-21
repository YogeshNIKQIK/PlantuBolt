// pages/api/project/[id]/custom-fields/[customField].js
import mongoose from "mongoose";
import dbConnect from "../../../../../../../../lib/dbConnect";
import Workspace from "../../../../../../../../models/workSpace";

export default async function handler(req, res) {
  const { method } = req;
  const { workspaceId, id, customField } = req.query;
  console.log(req.query);

  // Connect to the database
  await dbConnect();

  switch (method) {
    case "PUT": // Update an existing custom field
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res.status(404).json({ success: false, message: "Workspace not found" });
        }

        const project = workspace.projects.id(id);
        if (!project) {
          return res
            .status(404)
            .json({ success: false, message: "Project not found in this workspace" });
        }

        const field = project.customFields.id(customField);
        if (!field) {
          return res.status(404).json({ success: false, message: "Custom field not found" });
        }

        // Update the field with the data from the request body
        Object.assign(field, req.body);
        await workspace.save();

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
    
        const field = project.customFields.id(customField);
        if (!field) {
          return res
            .status(404)
            .json({ success: false, message: "Custom field not found" });
        }
    
        project.customFields.pull(customField); // Correctly remove the custom field from the array
        await workspace.save(); // Save the updated workspace document
    
        res.status(200).json({ success: true, message: "Custom field deleted" });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
