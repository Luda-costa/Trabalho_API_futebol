export class FavoriteController {
  constructor(favoriteService) {
    this.favoriteService = favoriteService;
  }

  list = async (req, res) => {
    res.json(await this.favoriteService.list(req.user.id, req.validatedQuery));
  };

  create = async (req, res) => {
    const favorite = await this.favoriteService.create(req.user.id, req.body, req.correlationId);
    res.status(201).json(favorite);
  };

  remove = async (req, res) => {
    await this.favoriteService.remove(req.user.id, req.params.id);
    res.status(204).send();
  };
}
