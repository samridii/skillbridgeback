const Gig = require('../models/Gig');

// only verified users can create gigs, enforced by route middleware not here
const createGig = async (req, res) => {
  try {
    const gig = await Gig.create({
      ...req.body,
      seller: req.user._id, // always from session, never from client input
    });
    res.status(201).json(gig);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create gig' });
  }
};

// public browse, only active gigs visible
const listGigs = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { status: 'active' };
    if (category) filter.category = category;

    const gigs = await Gig.find(filter).populate('seller', 'fullName'); // only expose seller name, not email or other fields
    res.status(200).json(gigs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gigs' });
  }
};

// get single gig by id
const getGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('seller', 'fullName');
    if (!gig) return res.status(404).json({ error: 'Gig not found' });
    res.status(200).json(gig);
  } catch (err) {
    res.status(400).json({ error: 'Invalid gig id' }); // bad ObjectId format lands here
  }
};

// only the seller who owns this gig can update it, this is the IDOR check
const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ error: 'Gig not found' });

   if (gig.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to modify this gig' }); // Vulnerability check
  }

    Object.assign(gig, req.body);
    await gig.save();
    res.status(200).json(gig);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update gig' });
  }
};

// soft delete, keeps records for audit purposes rather than hard removing
const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ error: 'Gig not found' });

    if (gig.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to modify this gig' });
    }

    gig.status = 'removed';
    await gig.save();
    res.status(200).json({ message: 'Gig removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gig' });
  }
};

module.exports = { createGig, listGigs, getGig, updateGig, deleteGig };