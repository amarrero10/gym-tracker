export const testRoute = (req, res) => {
  res
    .status(200)
    .json({ status: "I am running from contoller and DB is connected :)" });
};
