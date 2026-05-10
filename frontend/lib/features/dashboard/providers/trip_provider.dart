import 'package:flutter/material.dart';
import '../../../models/trip_model.dart';
import '../../../core/api_client.dart';

class TripProvider with ChangeNotifier {
  List<Trip> _trips = [];
  bool _isLoading = false;
  String? _error;

  List<Trip> get trips => _trips;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchUserTrips(int userId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiClient.get('/trips/user/$userId');
      if (response != null && response is List) {
        _trips = response.map((data) => Trip.fromJson(data)).toList();
      } else {
        _trips = [];
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchTripDetails(int tripId) async {
    try {
      final response = await ApiClient.get('/trips/$tripId');
      if (response != null) {
        final updatedTrip = Trip.fromJson(response);
        final index = _trips.indexWhere((t) => t.id == tripId);
        if (index != -1) {
          _trips[index] = updatedTrip;
          notifyListeners();
        }
      }
    } catch (e) {
      print('Error fetching trip details: $e');
    }
  }
}
