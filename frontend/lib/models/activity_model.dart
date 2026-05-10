class Activity {
  final int id;
  final String title;
  final String? description;
  final String category;
  final double estimatedCost;
  final int duration;
  final String? imageUrl;
  final int cityId;

  Activity({
    required this.id,
    required this.title,
    this.description,
    required this.category,
    required this.estimatedCost,
    required this.duration,
    this.imageUrl,
    required this.cityId,
  });

  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      category: json['category'],
      estimatedCost: (json['estimated_cost'] as num).toDouble(),
      duration: json['duration'],
      imageUrl: json['image_url'],
      cityId: json['city_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'estimated_cost': estimatedCost,
      'duration': duration,
      'image_url': imageUrl,
      'city_id': cityId,
    };
  }
}
