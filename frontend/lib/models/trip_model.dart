import 'city_model.dart';
import 'activity_model.dart';

class Trip {
  final int id;
  final String title;
  final String? description;
  final DateTime startDate;
  final DateTime endDate;
  final String visibility;
  final String? coverImage;
  final double totalBudget;
  final int userId;
  final DateTime createdAt;
  final List<TripStop> stops;

  Trip({
    required this.id,
    required this.title,
    this.description,
    required this.startDate,
    required this.endDate,
    required this.visibility,
    this.coverImage,
    required this.totalBudget,
    required this.userId,
    required this.createdAt,
    required this.stops,
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    return Trip(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      startDate: DateTime.parse(json['start_date']),
      endDate: DateTime.parse(json['end_date']),
      visibility: json['visibility'],
      coverImage: json['cover_image'],
      totalBudget: (json['total_budget'] as num).toDouble(),
      userId: json['user_id'],
      createdAt: DateTime.parse(json['created_at']),
      stops: (json['stops'] as List<dynamic>?)
              ?.map((e) => TripStop.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class TripStop {
  final int id;
  final int tripId;
  final int cityId;
  final DateTime arrivalDate;
  final DateTime departureDate;
  final int stopOrder;
  final City city;
  final List<StopActivity> stopActivities;

  TripStop({
    required this.id,
    required this.tripId,
    required this.cityId,
    required this.arrivalDate,
    required this.departureDate,
    required this.stopOrder,
    required this.city,
    required this.stopActivities,
  });

  factory TripStop.fromJson(Map<String, dynamic> json) {
    return TripStop(
      id: json['id'],
      tripId: json['trip_id'],
      cityId: json['city_id'],
      arrivalDate: DateTime.parse(json['arrival_date']),
      departureDate: DateTime.parse(json['departure_date']),
      stopOrder: json['stop_order'],
      city: City.fromJson(json['city']),
      stopActivities: (json['stop_activities'] as List<dynamic>?)
              ?.map((e) => StopActivity.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class StopActivity {
  final int id;
  final int tripStopId;
  final int activityId;
  final DateTime? scheduledTime;
  final String? customNotes;
  final Activity activity;

  StopActivity({
    required this.id,
    required this.tripStopId,
    required this.activityId,
    this.scheduledTime,
    this.customNotes,
    required this.activity,
  });

  factory StopActivity.fromJson(Map<String, dynamic> json) {
    return StopActivity(
      id: json['id'],
      tripStopId: json['trip_stop_id'],
      activityId: json['activity_id'],
      scheduledTime: json['scheduled_time'] != null
          ? DateTime.parse(json['scheduled_time'])
          : null,
      customNotes: json['custom_notes'],
      activity: Activity.fromJson(json['activity']),
    );
  }
}
