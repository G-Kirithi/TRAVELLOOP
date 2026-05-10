import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../models/trip_model.dart';
import '../../../core/theme.dart';

class TimelineView extends StatelessWidget {
  final List<TripStop> stops;

  const TimelineView({Key? key, required this.stops}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (stops.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32.0),
          child: Text('No stops added to this trip yet.'),
        ),
      );
    }

    // Sort stops by order
    final sortedStops = List<TripStop>.from(stops)..sort((a, b) => a.stopOrder.compareTo(b.stopOrder));

    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: sortedStops.length,
      itemBuilder: (context, index) {
        final stop = sortedStops[index];
        final isLast = index == sortedStops.length - 1;
        
        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildTimelineIndicator(isLast),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 24.0),
                  child: _buildStopCard(context, stop),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTimelineIndicator(bool isLast) {
    return SizedBox(
      width: 40,
      child: Column(
        children: [
          Container(
            width: 16,
            height: 16,
            decoration: const BoxDecoration(
              color: AppTheme.secondaryColor,
              shape: BoxShape.circle,
            ),
          ),
          if (!isLast)
            Expanded(
              child: Container(
                width: 2,
                color: AppTheme.secondaryColor.withOpacity(0.5),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStopCard(BuildContext context, TripStop stop) {
    final dateFormat = DateFormat('MMM d');
    final String dateRange = '${dateFormat.format(stop.arrivalDate)} - ${dateFormat.format(stop.departureDate)}';

    return Card(
      elevation: 1,
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  stop.city.name,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Text(
                  dateRange,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            if (stop.stopActivities.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text('Activities:', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              ...stop.stopActivities.map((sa) => Padding(
                    padding: const EdgeInsets.only(bottom: 4.0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('• ', style: TextStyle(fontSize: 16)),
                        Expanded(
                          child: Text(
                            sa.activity.title,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ),
                      ],
                    ),
                  )),
            ],
          ],
        ),
      ),
    );
  }
}
