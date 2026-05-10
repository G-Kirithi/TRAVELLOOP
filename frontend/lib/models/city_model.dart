class City {
  final int id;
  final String name;
  final String country;
  final int costIndex;
  final double popularityScore;
  final String? imageUrl;

  City({
    required this.id,
    required this.name,
    required this.country,
    required this.costIndex,
    required this.popularityScore,
    this.imageUrl,
  });

  factory City.fromJson(Map<String, dynamic> json) {
    return City(
      id: json['id'],
      name: json['name'],
      country: json['country'],
      costIndex: json['cost_index'],
      popularityScore: (json['popularity_score'] as num).toDouble(),
      imageUrl: json['image_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'country': country,
      'cost_index': costIndex,
      'popularity_score': popularityScore,
      'image_url': imageUrl,
    };
  }
}
