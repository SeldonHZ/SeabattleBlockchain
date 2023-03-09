from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import cv2
import os
app = Flask(__name__)
cors = CORS(app)

def generator(matrix, user) : #the input is matrix and as output this function creates image
    folder = os.path.dirname(os.path.abspath(__file__)) #local folder path 
    background = Image.open(folder + "\\layers\\background.png") #loads picture data in variable background
    for i in range(10) : # going through each line of matrix
        for j in range(10) : # going through each cell of matrix 
            if matrix[i][j] < 2 : continue # if number in matrix cell is less that 2 it is left empty
            elif matrix[i][j] == 2 : # if number in matrix cell is 2 than png picture waves is loaded in variable icon
                icon = cv2.imread(folder + "\\layers\\waves.png")
            elif matrix[i][j] == 3 : # if number in matrix cell is 3 than png picture miss is loaded in variable icon
                icon = cv2.imread(folder + "\\layers\\miss.png")
            elif matrix[i][j] == 4 : # if number in matrix cell is 4 than png picture hit is loaded in variable icon
                icon = cv2.imread(folder + "\\layers\\hit.png")
            height, width, z = icon.shape # getting dimensions of icon pucture, in this case it is 31 by 31 px (z coordinate is not important)
            heightB, widthB = background.size # getting dimensions of background pucture, in this case it is 342 by 342 px
            #since we want to place icon on backround, we need to locate icon on the right spot. Also I can't merge to pictures with different 
            #dimensions, so to do that I will add transparent pixels to icon so it would be 342 by 342 px just like background
            x = 7 + j*33 # the amount of transperent pixel lines I will add to the left of the icon so it would be in the right spot
            y = 7 + i*33 # the amount of transperent pixel lines I will add above icon so it would be in the right spot
            icon = cv2.copyMakeBorder( # this function adds black pixel lines to the icon so it would match background dimensions (342 by 342 px)
                icon, # the picture we modify
                y, # the amount of black lines added above icon
                heightB - height - y, # the amount of black lines added below icon
                x, # the amount of black lines added to the left of the icon
                widthB - width - x, # the amount of black lines added to the right of the icon
                cv2.BORDER_CONSTANT, 
                value=-1 # the color is black
                )
            alpha = np.sum(icon, axis=-1) > 0 # alpha is array of all pixels and if color of pixel if black it contains 0 in alpha
            alpha = np.uint8(alpha * 255) # for nonblack pixels alpha contains 255
            icon = cv2.merge((icon, alpha)) # this way black pixels are erased and become transparent and the icon pixels are left without editing
            cv2.imwrite(folder + "\\temp\\" + user + ".png", icon) # saving result picture in output file
            icon = Image.open(folder + "\\temp\\" + user + ".png") # creating PIL variable of icon
            background = Image.alpha_composite(background, icon) # merging icon and backround (icon is upper layer)
    background.save(folder + "\\temp\\" + user + ".png") # saving the final result of this function
    return "generation was successfull"

def rename(id, user) :
    folder = os.path.dirname(os.path.abspath(__file__))
    try :
        os.rename(folder + "\\temp\\" + user + ".png", folder[:-3] + "public\\tokens\\" + user + "\\token" + id + ".png")
    except FileExistsError : 
        os.remove(folder[:-3] + "public\\tokens\\" + user + "\\token" + id + ".png")
        os.rename(folder + "\\temp\\" + user + ".png", folder[:-3] + "public\\tokens\\" + user + "\\token" + id + ".png")
    except FileNotFoundError :
        os.mkdir(folder[:-3] + "public\\tokens\\" + user)
        os.rename(folder + "\\temp\\" + user + ".png", folder[:-3] + "public\\tokens\\" + user + "\\token" + id + ".png")

@app.route("/permission", methods=["GET"])
def set_permission():
    id = request.args.get("id")
    user = request.args.get("user")
    rename(id, user)
    ans = "token minting successful"
    return jsonify(ans)

@app.route("/receiver", methods=["POST"])
def postME():
    data = request.get_json()
    generator(data[0], data[1])
    ans = "generation was successful"
    return jsonify(ans)

if __name__ == "__main__": 
    app.run(host='127.0.0.1', port=5000, debug = True)