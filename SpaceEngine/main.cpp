#include <iostream>
#include "Headers/Simulation.hpp"

int main() 
{
	ContextSettings context;
	context.antialiasingLevel = 8;
	VideoMode videoMode = VideoMode::getDesktopMode();
	RenderWindow window(videoMode, "", Style::Fullscreen, context);

	View world;
	world.setSize(Vector2f(window.getSize() * (unsigned)1000));
	world.setCenter(Vector2f(window.getSize() / (unsigned)2));

	Clock logic;
	Time accumulate = Time::Zero;
	Time deltaTime = seconds(1.f / 20.f);

	bool running = true;
	bool pause = false;

	Simulation simulation;
	Planet planet(L"Солнце", 6960, 1.9891 * pow(10, 25), Vector2f(window.getSize() / (unsigned)2), Vector2f(0, 0), std::make_tuple<int, int, int>(255, 255, 0));
	simulation.addPlanet(planet);

	while (running)
	{
		Event event;
		while (window.pollEvent(event))
		{
			if (event.type == Event::Closed)
			{
				running = false;
			}
		}
		accumulate += logic.restart();
		if (accumulate >= deltaTime) 
		{
			accumulate -= deltaTime;
			if (!pause)
			{

			}
		}
		window.setView(world);
		window.clear(Color::Black);
		for (Planet& planet : simulation.planets)
		{
			CircleShape planetDraw;
			float radius = planet.radius;
			planetDraw.setRadius(radius);
			planetDraw.setOrigin(radius / 2, radius / 2);
			planetDraw.setPosition(planet.position);
			std::tuple color = planet.color;
			planetDraw.setFillColor(Color(std::get<0>(color), std::get<1>(color), std::get<2>(color)));
			window.draw(planetDraw);
		}
		window.display();
	}
	return 0;
}