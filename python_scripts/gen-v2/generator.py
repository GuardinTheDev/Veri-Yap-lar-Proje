from faker import Faker
import json
import os
import math
import random
import matplotlib.pyplot as plt
import numpy as np
from itertools import product

fakegen = Faker()
        
class WeightedTransitGraph():
    AutoIntegrityCheck = False

    def __init__(self):
        self.nodeList = []
        self.lineList = []
    
    class TransitLine():

        class TransitLineTypes():
            class BaseLineType(): pass

            class CircularLine(BaseLineType): pass
            class InvalidLine(BaseLineType): pass
            class LinearLine(BaseLineType): pass

        def __init__(self, name: str, parentGraph: WeightedTransitGraph):
            self.lineType = WeightedTransitGraph.TransitLine.TransitLineTypes.LinearLine
            self.name = name
            self.nodeList = [] 
            self.parentGraph = parentGraph
            self.initialNode = None # id=0 is always the initial node
        


        class LineStopNode():
            def __init__(self, parentList, value):
                self.value = value
                self.nextNode = None
                self.id = len(parentList.nodeList)
                self.parentList = parentList
                self.parentList.nodeList.append(self)
                
            def setNextNode(self, nextnode):
                temp = self.nextNode
                self.nextNode = nextnode
                nextnode.nextNode = temp
                
            def getPreviousNode(self):
                for x in self.parentList.nodeList:
                    if x.nextNode == self:
                        return x
                    else:
                        # print("No previous node")
                        return None
        def addNode(node: LineStopNode):
            pass

        def getNodeById(self, id):
            return self.nodeList[id]

        def removeNode(self, targetNode: LineStopNode):
            next = targetNode.nextNode
            prev = targetNode.getPreviousNode()
            if prev is not None:
                prev.setNextNode = next
                self.nodeList.pop(self.getNodeById(targetNode))
        
        def convertLineNodeToTransitNode(self, node):
            pass
        
        def checkIntegrity(self): # check if the linked list is valid
            if len(self.nodeList) == 0: 
                print("List empty")
                return
            
            visitedNodes = []
            iterations = 0
            node: WeightedTransitGraph.TransitLine.LineStopNode
            node = self.nodeList[0]
            iterations += 1
            visitedNodes.append(node)
            node = node.nextNode

            # traversal function
            while True:
                if node is None:
                    print("End of list")
                    self.lineType = WeightedTransitGraph.TransitLine.TransitLineTypes.LinearLine
                    break

                if node == self.nodeList[0]:
                    print("reached initial node")
                    self.lineType = WeightedTransitGraph.TransitLine.TransitLineTypes.CircularLine
                    break
                    
                if node in visitedNodes:
                    print("there is a loop inside")
                    self.lineType = WeightedTransitGraph.TransitLine.TransitLineTypes.InvalidLine
                    break
                visitedNodes.append(node)
                iterations += 1
                node = node.nextNode

            if iterations != len(self.nodeList):
                self.lineType = WeightedTransitGraph.TransitLine.TransitLineTypes.InvalidLine
                print("invalid list")


    class TransitStopNode():
        def __init__(self, name, parentGraph: (WeightedTransitGraph)) -> None:
            self.name = name
            self.parentGraph = parentGraph
            self.id = parentGraph.nodeList.__len__()
            self.connectedNodes = []
            
        def connectNode(self, node, weight, line):
            self.connectedNodes.append((node, weight, line))
            node.connectedNodes.appent((node, weight, line))

    def addNewLine(self, name):
        newLine = self.TransitLine(name, self)
        return newLine
    
    def addNewLine(self, name, stopList):
        newLine = self.TransitLine(name, self)
        stopList[0] = newLine

    def addNode(self, name):
        node = self.TransitStopNode(name, self)
        self.nodeList.append(node)
        return node
    
    def getChildByName(self, name):
        i: WeightedTransitGraph.TransitStopNode
        for i in self.nodeList:
            if i.name == name:
                return(i)

    class RandomGenerator():
        def __init__(self, coordRange: tuple):
            # generate a square map
            if len(coordRange) != 2:
                raise(ValueError)
            for i in coordRange:
                if type(i) is not int:
                    raise(TypeError)
            self.coordRange = coordRange
            self.stopList = []
        

        def generateStopCoordinates(self, faker:Faker, stopCount:int, minDist=0):

            @staticmethod
            def euclideanDistance(a,b):
                return math.sqrt(math.pow(a[0]-b[0],2) + math.pow(a[1]-b[1],2))

            @staticmethod
            def isFarEnough(minDist, list, coord:tuple):
                for i in list:
                    dist = euclideanDistance(i, coord)
                    if dist < minDist:
                        return False
                return True


            lastIndex = len(self.stopList)

            # generate all unique tuple possibilities within range and sample stopCount of them
            #coordList = random.sample(list(product(range(self.coordRange[0], self.coordRange[1]), repeat=2)), k=stopCount)

            # manual sampling:
            allPossibleCoordinates = list(product(range(self.coordRange[0], self.coordRange[1]), repeat=2))
            #print(allPossibleCoordinates)
            print(len(allPossibleCoordinates))
            if stopCount > len(allPossibleCoordinates): raise(ValueError) 
            # alternatively, use (abs(self.coordRange[1]-self.coordRange[0]))^2 which would return the same value
            # raise an exception if asked to sample more stops than possible

            coordList = []
            while True:
                if len(allPossibleCoordinates)==0:
                    raise(ValueError)
                if len(coordList) == stopCount:
                    break
                v: int
                max = len(allPossibleCoordinates)-1
                v = random.randint(0,max)
                print(v)
                temp = allPossibleCoordinates.pop(v)
                #print(temp)
                if isFarEnough(minDist, coordList, temp):
                    coordList.append(temp)
                    print(temp)
                

            for i,v in enumerate(coordList):
                newStop = {
                    "id": i+lastIndex,
                    "name": faker.street_address(),
                    "x": v[0],
                    "y": v[1],
                    "lines": None
                }
                self.stopList.append(newStop)
        
        def plotStops(self):
            fig = plt.figure()
            plot1 = fig.add_subplot(1,1,1)
            x = []
            y = []
            txt = []
            for stop in self.stopList:
                x.append(stop["x"])
                y.append(stop["y"])
                txt.append("ID:"+str(stop["id"]))
            x = np.array(x)
            y = np.array(y)
            plot1.scatter(x,y)
            for i, v in enumerate(txt):
                plot1.annotate(v, (x[i], y[i]))
            plt.show()


gen = WeightedTransitGraph.RandomGenerator((0,200))
gen.generateStopCoordinates(fakegen, 20, 10)
print(gen.stopList)
gen.plotStops()