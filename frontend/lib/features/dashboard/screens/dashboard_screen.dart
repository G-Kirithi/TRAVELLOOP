import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/trip_provider.dart';
import '../widgets/trip_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch trips for user 1 (hardcoded for now)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TripProvider>().fetchUserTrips(1);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Trips'),
        actions: [
          IconButton(
            icon: const Icon(Icons.explore),
            onPressed: () {
              context.go('/discover');
            },
            tooltip: 'Discover',
          ),
        ],
      ),
      body: Consumer<TripProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Error: ${provider.error}', style: const TextStyle(color: Colors.red)),
                  ElevatedButton(
                    onPressed: () => provider.fetchUserTrips(1),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (provider.trips.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.airplanemode_inactive, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  Text('No trips found', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      context.go('/discover');
                    },
                    child: const Text('Start Planning'),
                  )
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.fetchUserTrips(1),
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: provider.trips.length,
              itemBuilder: (context, index) {
                final trip = provider.trips[index];
                return TripCard(
                  trip: trip,
                  onTap: () {
                    context.go('/trip/${trip.id}');
                  },
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Implement create trip flow
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Create trip coming soon!')),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
