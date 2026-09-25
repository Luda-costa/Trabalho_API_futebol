export class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  register = async (req, res) => {
    const user = await this.userService.register(req.body);
    res.status(201).json(user);
  };
}
