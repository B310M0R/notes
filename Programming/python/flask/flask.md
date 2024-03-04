# Flask
Python-based minimalistic framework  
To start work we need to create project. Create folder + venv:
```
python3 -m venv <project name>
source <proejct name>/bin/activate
```
To deactivate venv:
```
deactivate
```

Install flask:
```
pip install flask
```
Lib for connecting flask project with DB:
```
pip install flask-sqlalchemy
```
Create file `app.py` inside project folder  
Code references look in app.py  

After writing a code we can simply run code and visit our page at `localhost:5000`  
All HTML pages must be stored in `templates` folder

## Template inheritance
In order not to copy HTML pages and use lot of code we can use inheritance.  
