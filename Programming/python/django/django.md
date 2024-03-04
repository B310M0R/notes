# Django
Python backend framework. Must work in venv (python virtual env)  
To install venv, in project folder we need run 
```
python3 -m venv <venv name>
```
To start to work inside of venv:
```
source venv/bin/activate
```
To return to normal env run `deactivate` command  
Install:
```
pip install django
```

list main commands:
```
django-admin
```
Create project of website:
```
django-admin startproejct <project_name>
```
`project_name` will appear in project folder. There will be config files for project.  
`manage.py` is a main config file for our project.  

Run project:
```
python manage.py runserver
```