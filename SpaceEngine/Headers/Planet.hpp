#pragma once
#include <SFML/Graphics.hpp>
#include <corecrt_wstring.h>

using namespace sf;

class Planet 
{
public:
	Planet(std::wstring name, float radius, float mass, Vector2f position, Vector2f velocity, std::tuple<int, int, int> color);

	void updateDerivatives(float deltaTime);
	void resetDerivatives(float deltaTime);
	void move(Vector2f vector);

	bool operator==(const Planet& other) const;
	bool operator!=(const Planet& other) const;

	Vector2f position;
	Vector2f positionPrevious;
	float mass;
	float radius;
	std::tuple<int, int, int> color;
	Vector2f force;
	Vector2f velocity;
	std::wstring name;
};