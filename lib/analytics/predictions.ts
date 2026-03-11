export function isForecastOverdue(
  forecastFinishDate: string | null,
  plannedEndDate: string | null,
  actualProgress: number
) {
  if (!forecastFinishDate || !plannedEndDate || actualProgress >= 100) {
    return false;
  }

  return new Date(forecastFinishDate).getTime() > new Date(plannedEndDate).getTime();
}
