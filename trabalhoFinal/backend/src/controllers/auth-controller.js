export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  login = async (req, res) => {
    res.json(await this.authService.login(req.body));
  };
}
