import 'package:flutter/material.dart';
import '../../../models/city_model.dart';
import '../../../models/activity_model.dart';
import '../../../core/api_client.dart';

class DiscoverProvider with ChangeNotifier {
  List<City> _cities = [];
  List<City> _filteredCities = [];
  List<Activity> _activities = [];
  bool _isLoading = false;
  String? _error;

  List<City> get cities => _filteredCities;
  List<Activity> get activities => _activities;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchCities() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiClient.get('/cities/');
      if (response != null && response is List) {
        _cities = response.map((data) => City.fromJson(data)).toList();
        _filteredCities = _cities;
      } else {
        _cities = [];
        _filteredCities = [];
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void searchCities(String query) {
    if (query.isEmpty) {
      _filteredCities = _cities;
    } else {
      _filteredCities = _cities.where((city) {
        return city.name.toLowerCase().contains(query.toLowerCase()) ||
               city.country.toLowerCase().contains(query.toLowerCase());
      }).toList();
    }
    notifyListeners();
  }

  Future<void> fetchActivitiesForCity(int cityId) async {
    try {
      final response = await ApiClient.get('/cities/$cityId/activities');
      if (response != null && response is List) {
        _activities = response.map((data) => Activity.fromJson(data)).toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error fetching activities: $e');
    }
  }
}
