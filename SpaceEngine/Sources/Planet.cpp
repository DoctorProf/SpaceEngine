#include "../Headers/Planet.hpp"

Planet::Planet(std::wstring name, float radius, float mass, Vector2f position, Vector2f velocity, std::tuple<int, int, int> color)
{
	this->name = name;
	this->radius = radius;
	this->mass = mass;
	this->position = position;
	this->positionPrevious = position;
	this->velocity = velocity;
	this->color = color;
	this->force = Vector2f(0, 0);
}
void Planet::updateDerivatives(float deltaTime)
{
	/*positionPrevious = position;
	velocity += force * deltaTime;
	position += velocity * deltaTime;*/
	position += (velocity + force * deltaTime) * deltaTime;
}
void Planet::resetDerivatives(float deltaTime)
{
	velocity = (position - positionPrevious) / deltaTime;
	force = Vector2f(0, 0);
}
void Planet::move(Vector2f vector)
{
	position += vector;
}
bool Planet::operator==(const Planet& other) const
{
	return position == other.position;
}
bool Planet::operator!=(const Planet& other) const
{
	return position != other.position;
}