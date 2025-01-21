import mongoose from 'mongoose';
 
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  accountId: { type: String, required: true },
  role: { type: String },
  phone: { type: String },
  bio: {type: String},
  location: {type: String},
  dob: {type: String},
  timezone: {type: String},
  profileImage: { type: String },
  coverImage: { type: String },
  resetToken: { type: String },
  passwordToken: { type: String },
  resetTokenExpiry: { type: Date },
  organizationName: { type: String },
  subdomainName: { type: String, required: true },
  profileImage: {
    filename: { type: String },
    contentType: { type: String },
    data: { type: Buffer }
  },
  coverImage: {
    filename: { type: String },
    contentType: { type: String },
    data: { type: Buffer }
  }
});
 
export default mongoose.models.OrgAccount || mongoose.model('OrgAccount', UserSchema);