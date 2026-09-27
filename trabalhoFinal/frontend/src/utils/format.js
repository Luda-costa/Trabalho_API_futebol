export function formatDate(value, includeTime = false) {
  if (!value) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', includeTime
    ? { dateStyle: 'short', timeStyle: 'short' }
    : { dateStyle: 'medium' }
  ).format(new Date(value));
}

export const statusLabels = {
  SCHEDULED: 'Agendada', TIMED: 'Agendada', IN_PLAY: 'Em jogo', PAUSED: 'Intervalo',
  EXTRA_TIME: 'Prorrogação', PENALTY_SHOOTOUT: 'Pênaltis', FINISHED: 'Encerrada',
  SUSPENDED: 'Suspensa', POSTPONED: 'Adiada', CANCELLED: 'Cancelada', AWARDED: 'Definida'
};

export function initials(name = '?') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}
