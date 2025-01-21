import dbConnect from '../../../lib/dbConnect';
import OrgAccount from '../../../models/orgAccount';

export default async function handler(req, res) {
  await dbConnect();

  const { accountId, subdomain } = req.query;

  if (req.method === 'GET') {
    if (!accountId || !subdomain) {
      return res.status(400).json({ error: 'Account ID and Subdomain are required' });
    }

    try {
      // Fetch users from the database where accountId matches
      const agents = await OrgAccount.find({ accountId, subdomainName: subdomain }).select('name email phone role bio location dob timezone profileImage coverImage'); //Add more as required
      return res.status(200).json(agents);
    } catch (error) {
      return res.status(500).json({ error: 'Error fetching agents' });
    }
  }

  if (req.method === 'PUT') {
    const { id, name, email, phone, role, bio, location, dob, timezone, profileImage, coverImage } = req.body;

    if (!accountId || !subdomain) {
      return res.status(400).json({ error: 'Account ID and Subdomain are required' });
    }

    if (!id) {
      return res.status(400).json({ error: 'User ID is required for updating' });
    }

    try {
      //Update the the edited data
      const updatedAgent = await OrgAccount.findOneAndUpdate(
        { _id: id, accountId, subdomainName: subdomain },
        { name, email, phone, role, bio, location, dob, timezone, profileImage, coverImage },
        { new: true, runValidators: true } 
      );

      if (!updatedAgent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      return res.status(200).json(updatedAgent);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Error updating agent' });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
