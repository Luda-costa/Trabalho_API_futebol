export class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  listUsers = async (req, res) => {
    res.json(await this.adminService.list(req.validatedQuery));
  };

  setUserActive = async (req, res) => {
    res.json(await this.adminService.setActive(req.params.id, req.body.ativo));
  };
}
