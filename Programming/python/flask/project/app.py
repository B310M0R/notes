from flask import Flask, render_template
#render_template is a lib for rendering HTML pages

app = Flask(__name__)
#import filename as name of main file for project
#app is an object from class Flask

@app.route('/')
@app.route('/home')
def index():
    return render_template("index.html")


@app.route('/about')
def about():
    return render_template("about.html")
#base routing. When to decorators with different locations are used (/ and /home) they all will launch only one function

@app.route('/user/<string:name>/<int:id>')
def user(name, id):
    return f"Page of user {name} with id {id}"
# Here we let client to pass parameters into url and those parameters will be used in page render

if __name__ == "__main__":
    app.run(debug=True)

# when our app is launched, this file becomes __main__ file. And if it's main, we run it as flask app
# debug parameter is True during development and must set to False when deploying project
