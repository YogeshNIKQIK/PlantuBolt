import dbConnect from '../../lib/dbConnect'; // Adjust the path to your dbConnect utility
import project from '../../models/project';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  if (method === 'POST') {
    try {
      const Projects = await project.create(req.body); // Create a new project in the database
      res.status(201).json({ success: true, Projects });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (method === 'GET') {
    try {
      const { accountId, subdomainName } = req.query;
      console.log(req.query);

      // Ensure both accountId and subdomainName are provided
      if (!accountId || !subdomainName) {
        return res.status(400).json({ success: false, error: 'Both accountId and subdomainName are required.' });
      }

      // Fetch projects where both accountId and subdomainName match
      const projects = await project.find({ accountId, subdomainName }); 

      if (projects.length === 0) {
        return res.status(404).json({ success: false, error: 'No projects found matching both accountId and subdomainName.' });
      }

      res.status(200).json({ success: true, projects });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    // Handle any other HTTP methods
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
