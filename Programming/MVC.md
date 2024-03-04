# MVC
Development pattern, consiste of:
* Model
* View
* Controller
View -> User interaction -> Controller -> Model -> View
## Model
Receives data from controllers, does some operations and send it to view. Method that is launched by controller and do all actions with data. Business logic  
For example, could create/delete users, return to view all users etc.
## View
Receives data from model and outputs it to user. Interface.
## Controller
Processes user's interactions, processes data from interactions and sends it to model. Handler of user's actions  
Must have MINIMAL logic, max logic - e.g. validate data from request.  


