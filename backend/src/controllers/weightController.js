import WeightEntry from "../models/WeightEntry.js";

export const getWeightEntries = async (req, res) => {
  try {
    const { userId } = req.user;

    const entries = await WeightEntry.find({ userId }).sort({ date: "asc" });

    return res.status(200).json({ entries });
  } catch (error) {
    console.error("Error fetching weight entries:", error);
    return res.status(500).json({ message: "Error fetching weight entries" });
  }
};

export const logWeight = async (req, res) => {
  try {
    const { userId } = req.user;
    const { weight, unit, date } = req.body;

    if (!weight || !date) {
      return res.status(400).json({ message: "weight and date are required" });
    }

    const entryDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (entryDate > today) {
      return res.status(400).json({ message: "Date cannot be in the future" });
    }

    const entry = await WeightEntry.create({
      userId,
      weight,
      unit: unit ?? "lbs",
      date: new Date(date),
    });

    return res.status(201).json({ entry });
  } catch (error) {
    console.error("Error logging weight:", error);
    return res.status(500).json({ message: "Error logging weight" });
  }
};

export const updateWeightEntry = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { weight, date } = req.body;

    const entry = await WeightEntry.findOne({ _id: id, userId });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    if (weight !== undefined) entry.weight = weight;
    if (date !== undefined) {
      const entryDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (entryDate > today) {
        return res.status(400).json({ message: "Date cannot be in the future" });
      }
      entry.date = entryDate;
    }

    await entry.save();

    return res.status(200).json({ entry });
  } catch (error) {
    console.error("Error updating weight entry:", error);
    return res.status(500).json({ message: "Error updating weight entry" });
  }
};

export const deleteWeightEntry = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const entry = await WeightEntry.findOneAndDelete({ _id: id, userId });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    return res.status(200).json({ message: "Entry deleted" });
  } catch (error) {
    console.error("Error deleting weight entry:", error);
    return res.status(500).json({ message: "Error deleting weight entry" });
  }
};
