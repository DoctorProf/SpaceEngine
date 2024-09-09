#pragma once
#include <vector>
#include "Planet.hpp"

class Simulation
{
public:
	Simulation();
	void addPlanet(Planet& planet);
	void update(float deltaTime);

	std::vector<Planet> planets;
	float g = 6.67 * pow(10, -16);
};