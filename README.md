# TINF19C-Team-4-Service-Registry

![Logo](https://github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry/blob/master/Assets/Pictures/Logo.png)

### Welcome!

The Service-Registry is developed with the goal to improve and expand an existing software, which was originally developed by the previous course. 

## Contributors
- [Goran Erdeljan](https://github.com/GoranErdeljan)
- [Daniel Baumann](https://github.com/DanielErich)
- [Serdar Ilhan](https://github.com/serdarilhan)
- [Benedict Wetzel](https://github.com/wetzelbe) 

## About the Project

An asset in the meaning of Industry 4.0 can both be a single device and a Docker hosted application. 
In both cases there must be a way to announce the offered capabilities via a service discovery mechanism. A suitable mechanism for this is DNS-SD. The system combines the capabilities of DNS-SD and the already existing Service-Registry developed by the OI4-Alliance.

The Open Industry 4.0 Alliance is a collaboration between multiple Companies whose goal is to connect the companies and publish recommendations on which the companies can make better decisions regarding Industry 4.0. A Service Registry is an application that offers a list of available Services in the network.<br>
It makes it possible for Users and other applications to find a service matching their requirements.<br>
Therefore, the Service-Registry containsmData about the capabilities of the service.
The developed application allows on the one hand to use the DNS-SD mechanism to discover Services, that aren't already known to the Service Registry and on the other hand to announce the already known Services via DNS-SD in the Network.<br>

The new interface is implemented and integrated into an Example project on Linux. The interface runs in a Docker environment just like the provided Service Registry. The Docker Environment contains a MQTT-Broker, which hosts the OI4-Message-Bus.

Additionally, there are test applications, which also run in Docker Containers. These test applications are able to list the services that were announced over the network via a simple GUI. The developed applications are publicly available in form of an open source project.
