import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../widgets/timeline_view.dart';
import '../../dashboard/providers/trip_provider.dart';
import '../../../models/trip_model.dart';
import '../../../core/theme.dart';

class TripDetailsScreen extends StatefulWidget {
  final int tripId;

  const TripDetailsScreen({Key? key, required this.tripId}) : super(key: key);

  @override
  State<TripDetailsScreen> createState() => _TripDetailsScreenState();
}

class _TripDetailsScreenState extends State<TripDetailsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TripProvider>().fetchTripDetails(widget.tripId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<TripProvider>(
      builder: (context, provider, child) {
        final tripIndex = provider.trips.indexWhere((t) => (t as Trip).id == widget.tripId);
        if (tripIndex == -1) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final trip = provider.trips[tripIndex];
        return Scaffold(
          body: CustomScrollView(
            slivers: [
              _buildSliverAppBar(trip),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildTripSummary(context, trip),
                      const SizedBox(height: 32),
                      Text(
                        'Itinerary',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 16),
                      TimelineView(stops: trip.stops),
                    ],
                  ),
                ),
              ),
            ],
          ),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () {
              // TODO: Implement add stop
            },
            icon: const Icon(Icons.add_location_alt),
            label: const Text('Add Stop'),
          ),
        );
      },
    );
  }

  Widget _buildSliverAppBar(Trip trip) {
    return SliverAppBar(
      expandedHeight: 250.0,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          trip.title,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            shadows: [Shadow(color: Colors.black54, blurRadius: 4)],
          ),
        ),
        background: trip.coverImage != null
            ? Image.network(
                trip.coverImage!,
                fit: BoxFit.cover,
                color: Colors.black.withOpacity(0.3),
                colorBlendMode: BlendMode.darken,
              )
            : Container(
                color: AppTheme.primaryColor,
                child: const Icon(Icons.landscape, size: 80, color: Colors.white54),
              ),
      ),
    );
  }

  Widget _buildTripSummary(BuildContext context, Trip trip) {
    final dateFormat = DateFormat('MMM d, yyyy');
    return Card(
      elevation: 0,
      color: AppTheme.primaryColor.withOpacity(0.05),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: AppTheme.primaryColor.withOpacity(0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildSummaryItem(
              context,
              Icons.calendar_today,
              'Dates',
              '${dateFormat.format(trip.startDate)}\n${dateFormat.format(trip.endDate)}',
            ),
            _buildSummaryItem(
              context,
              Icons.account_balance_wallet,
              'Budget',
              '\$${trip.totalBudget.toStringAsFixed(2)}',
            ),
            _buildSummaryItem(
              context,
              Icons.place,
              'Stops',
              '${trip.stops.length}',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(BuildContext context, IconData icon, String label, String value) {
    return Column(
      children: [
        Icon(icon, color: AppTheme.primaryColor),
        const SizedBox(height: 8),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 4),
        Text(
          value,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
      ],
    );
  }
}
