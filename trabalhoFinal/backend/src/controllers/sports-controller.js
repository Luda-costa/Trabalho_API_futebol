export class SportsController {
  constructor(sportsService) {
    this.sportsService = sportsService;
  }

  listCompetitions = async (req, res) => res.json(await this.sportsService.listCompetitions(req.validatedQuery, req.correlationId));
  getCompetition = async (req, res) => res.json(await this.sportsService.getCompetition(req.params.id, req.correlationId));
  listCompetitionTeams = async (req, res) => res.json(await this.sportsService.listCompetitionTeams(req.params.id, req.correlationId));
  listCompetitionMatches = async (req, res) => res.json(await this.sportsService.listCompetitionMatches(req.params.id, req.validatedQuery, req.correlationId));
  listTeams = async (req, res) => res.json(await this.sportsService.listTeams(req.validatedQuery, req.correlationId));
  getTeam = async (req, res) => res.json(await this.sportsService.getTeam(req.params.id, req.correlationId));
  listMatches = async (req, res) => res.json(await this.sportsService.listMatches(req.validatedQuery, req.correlationId));
  getMatch = async (req, res) => res.json(await this.sportsService.getMatch(req.params.id, req.correlationId));
}
