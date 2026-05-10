import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

// Core imports
import 'core/theme.dart';

// Feature imports
import 'features/dashboard/providers/trip_provider.dart';
import 'features/dashboard/screens/dashboard_screen.dart';
import 'features/itinerary/screens/trip_details_screen.dart';
import 'features/discover/providers/discover_provider.dart';
import 'features/discover/screens/discover_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => TripProvider()),
        ChangeNotifierProvider(create: (_) => DiscoverProvider()),
      ],
      child: const TraveloopApp(),
    ),
  );
}

// GoRouter configuration
final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: '/discover',
      builder: (context, state) => const DiscoverScreen(),
    ),
    GoRoute(
      path: '/trip/:id',
      builder: (context, state) {
        final idStr = state.pathParameters['id'];
        final id = int.tryParse(idStr ?? '') ?? 0;
        return TripDetailsScreen(tripId: id);
      },
    ),
  ],
);

class TraveloopApp extends StatelessWidget {
  const TraveloopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Traveloop',
      theme: AppTheme.lightTheme,
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
    );
  }
}
