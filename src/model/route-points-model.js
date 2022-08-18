import { generateRoutePoint } from '../mock/route-point.js';
import { makeDestinations } from '../mock/destination-point.js';
import { CURRENT_OFFERS_COUNT } from '../mock/mock-data.js';

class RouteModel {
  routes = Array.from( {length:CURRENT_OFFERS_COUNT}, generateRoutePoint);
  destinations = makeDestinations();
  getRoutes = () => this.routes;
  getDestinations = () => this.destinations;
}

export { RouteModel };