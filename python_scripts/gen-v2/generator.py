from faker import Faker
import json
import os
import math
import random
import matplotlib.pyplot as plt
import numpy as np
from itertools import product
import networkx as nx #networkx is for displaying graph
import string
import copy

fakegen = Faker()

def euclideanDistance(a,b):
    return math.sqrt(math.pow(a[0]-b[0],2) + math.pow(a[1]-b[1],2))

class WeightedTransitGraph():
    AutoIntegrityCheck = False

    def __init__(self):
        self.nodeList = []
        self.lineList = []

    class Exceptions():
        class InvalidOperation(Exception):
            def __init__(self, message):
                self.message = message
                super().__init__(self.message)

    class TransitNodeConnection():
        def __init__(self, line, weight):
            self.line = line
            self.weight = weight

    class TransitStopNode():
        def __init__(self, name, X, Y, parentGraph: WeightedTransitGraph) -> None:
            self.name = name
            self.parentGraph = parentGraph
            self.connectedNodes = []
            self.X = X
            self.Y = Y
            self.parentGraph.nodeList.append(self)
            self.id = parentGraph.nodeList.index(self)
            
        def connectNode(self, node, weight, line):
            self.connectedNodes.append((node, weight, line))
            node.connectedNodes.appent((node, weight, line))
    
    class TransitLine():

        class TransitLineTypes():
            class BaseLineType(): pass

            class CircularLine(BaseLineType): pass
            class InvalidLine(BaseLineType): pass
            class LinearLine(BaseLineType): pass

        def __init__(self, name: str, parentGraph: WeightedTransitGraph):
            self.lineType = WeightedTransitGraph.TransitLine.TransitLineTypes.LinearLine
            self.name = name
            self.lineNodeList = [] 
            self.parentGraph = parentGraph
            self.initialNode = None # id=0 is usually the initial node
            self.id = len(parentGraph.lineList)
            parentGraph.lineList.append(self)
        

        class LineStopNode():
            def __init__(self, parentList: WeightedTransitGraph.TransitLine, GraphNode: WeightedTransitGraph.TransitStopNode):
                self.nextNode = None
                self.globalID = GraphNode.id
                self.parentList = parentList
                self.parentList.lineNodeList.append(self)
                self.TransitNode = GraphNode
                self.id = self.parentList.lineNodeList.index(self)
                
            def setNextNode(self, nextnode: WeightedTransitGraph.TransitLine.LineStopNode):
                temp = self.nextNode
                self.nextNode = nextnode
                if self.nextNode is not None:
                    nextnode.nextNode = temp
                
            def getPreviousNode(self):
                for x in self.parentList.lineNodeList:
                    if x.nextNode == self:
                        return x
                    else:
                        # print("No previous node")
                        return None
                    
        def addNodeAfter(self, previousNode: LineStopNode, GraphNode: WeightedTransitGraph.TransitStopNode):
            next = previousNode.nextNode 
            node = self.LineStopNode(self, GraphNode)
            previousNode.setNextNode(node)
            node.setNextNode(next)
            return node
        
        def addInitialNode(self, node: WeightedTransitGraph.TransitStopNode):
            lineNode = self.LineStopNode(self, node)
            self.lineNodeList.append(lineNode)
            self.setInitialNode(lineNode)
            return lineNode
        
        def getLastNode(self):
            if self.lineType is self.TransitLineTypes.CircularLine:
                return self.initialNode
            node = self.initialNode
            while True:
                if node.nextNode is not None:
                    node = node.nextNode
                else:
                    return node
        
        def setInitialNode(self, node: LineStopNode):
            if node.getPreviousNode() is not None:
                if self.lineType is self.TransitLineTypes.LinearLine:
                    raise(WeightedTransitGraph.Exceptions.InvalidOperation("Cannot change initial node on a linear line"))
                elif self.lineType is self.TransitLineTypes.CircularLine:
                    self.initialNode = node
            else:
                self.initialNode = node


        def getNodeById(self, id):
            return self.nodeList[id]

        def removeNode(self, targetNode: LineStopNode):
            next = targetNode.nextNode
            prev = targetNode.getPreviousNode()
            if self.initialNode == targetNode:
                self.initialNode = next
            if prev is not None:
                prev.setNextNode = next
                self.nodeList.pop(self.getNodeById(targetNode))
        
        def convertTransitNodeToLineNode(self, node: WeightedTransitGraph.TransitStopNode, line: WeightedTransitGraph.TransitLine):
            lineNode: WeightedTransitGraph.TransitLine.LineStopNode
            print(line)
            for lineNode in line.lineNodeList:
                if lineNode.TransitNode is node:
                    return lineNode
            raise(IndexError)
        
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


    def addNewLine(self, name):
        newLine = self.TransitLine(name, self)
        return newLine
    
    def addNewLine(self, name, stopList=[]):
        newLine = self.TransitLine(name, self)
        for i in range(len(stopList)):
            if i == 0: 
                newLine.addNodeAfter(stopList[i])
                continue
            newLine.addNodeAfter(stopList[i], stopList[i-1])
        return newLine

    def addNode(self, name, X, Y):
        node = self.TransitStopNode(name, X, Y, self)
        # self.nodeList.append(node)
        return node
    
    def getChildByName(self, name):
        i: WeightedTransitGraph.TransitStopNode
        for i in self.nodeList:
            if i.name == name:
                return(i)

    class _RandomGenerator():
        def __init__(self, coordRange: range, parentGraph):
            # generate a square map
            if len(coordRange) != 2:
                raise(ValueError)
            for i in coordRange:
                if type(i) is not int:
                    raise(TypeError)
            self.coordRange = coordRange
            # self.stopList = []
            self.parentGraph = parentGraph
        

        def generateStopCoordinates(self, faker:Faker, stopCount:int, minDist=0, maxDist=-1):

            @staticmethod
            def isFarEnough(minDist, list, coord:tuple):
                for i in list:
                    dist = euclideanDistance(i, coord)
                    if dist < minDist:
                        return False
                return True
            
            # lastIndex = len(self.stopList)

            # generate all unique tuple possibilities within range and sample stopCount of them
            #coordList = random.sample(list(product(range(self.coordRange[0], self.coordRange[1]), repeat=2)), k=stopCount)

            # manual sampling:
            allPossibleCoordinates = list(product(range(self.coordRange[0], self.coordRange[1]), repeat=2))
            #print(allPossibleCoordinates)
            # print(len(allPossibleCoordinates))
            if stopCount > len(allPossibleCoordinates): raise(ValueError) 
            # alternatively, use (abs(self.coordRange[1]-self.coordRange[0]))^2 which would return the same value
            # raise an exception if asked to sample more stops than possible

            @staticmethod
            def MaxDistCheck(maxDist, list):
                for x in list:
                    for i in list:
                        dist = euclideanDistance(i, x)
                        if dist > maxDist:
                            return False
                return True
            # max dist is kinda problematic, use at your own risk

            def sampleCoordinatesWithinDistance(stopCount, apc):
                allPossibleCoordinates = apc
                while True:
                    coordList = []
                    while True:
                        print(f"remaining coords:{len(allPossibleCoordinates)}, coordlist length: {len(coordList)}")
                        if len(allPossibleCoordinates)==0:
                            # raise(ValueError)
                            break
                        if len(coordList) == stopCount:
                            break
                        v: int
                        max = len(allPossibleCoordinates)-1
                        v = random.randint(0,max)
                        temp = allPossibleCoordinates.pop(v)
                        if isFarEnough(minDist, coordList, temp):
                            coordList.append(temp)
                    if maxDist != -1: # set maxDist to -1 to ignore max distance
                        if MaxDistCheck(maxDist, coordList):
                            return coordList
                    else:
                        return coordList
            
            coordList = sampleCoordinatesWithinDistance(stopCount, allPossibleCoordinates)
            print(len(coordList))

            for v in coordList:
                stopName = faker.street_address()
                #newStop = {
                #    "id": i+lastIndex,
                #    "name": stopName,
                #    "x": v[0],
                #    "y": v[1],
                #    "lines": None
                #}
                # self.stopList.append(newStop)

                self.parentGraph.addNode(name=stopName,X=v[0],Y=v[1])
            print(len(self.parentGraph.nodeList))
        
        def generateRandomLine(self, stopCount: range, maxDist=-1):
            graph = self.parentGraph
            list = copy.deepcopy(graph.nodeList)
            initialNode = list.pop(random.randint(0,len(list)-1))
            Line: WeightedTransitGraph.TransitLine
            characters = string.ascii_letters + string.digits
            k = random.randint(2,4)
            lineName: str
            lineName = random.choices(characters, k=k)
            Line = graph.addNewLine(lineName)
            currentNode = Line.addInitialNode(initialNode)
            currentNode: WeightedTransitGraph.TransitLine.LineStopNode
            i = stopCount-1
            while True:
                if type(currentNode) is not WeightedTransitGraph.TransitLine.LineStopNode: raise(TypeError)
                if i == 0:
                    break
                sel: WeightedTransitGraph.TransitStopNode
                sel = list.pop(random.randint(0,len(list)-1))
                dist = euclideanDistance((sel.X,sel.Y), (currentNode.TransitNode.X, currentNode.TransitNode.Y))
                if maxDist != -1:
                    if dist <= maxDist:
                        Line.addNodeAfter(currentNode, sel)
                        i -= 1
                        currentNode = currentNode.nextNode
                    else: continue
                else: 
                    Line.addNodeAfter(currentNode, sel)
                    i -= 1
                    currentNode = currentNode.nextNode
                
            # print(Line.lineNodeList)
        
        def plotStops(self):
            G = nx.MultiGraph()

            #fig = plt.figure()
            #plot1 = fig.add_subplot(1,1,1)
            x = []
            y = []
            txt = []
            pos = []

            #for stop in self.stopList:
            #    x.append(stop["x"])
            #    y.append(stop["y"])
            #    txt.append("ID:"+str(stop["id"]))
            #
            #    G.add_node(stop["id"])
            #    pos.insert(stop["id"], np.array([stop["x"],stop["y"]]))

            for node in self.parentGraph.nodeList:
                x.append(int(node.X))
                x.append(int(node.Y))
                txt.append(node.name)

                G.add_node(node.id)
                pos.insert(node.id, np.array([node.X,node.Y]))

            x = np.array(x)
            y = np.array(y)

            print(len(self.parentGraph.nodeList))
            #plot1.scatter(x,y)
            #for i, v in enumerate(txt):
            #    plot1.annotate(v, (x[i], y[i]))
            nx.draw(G, pos, with_labels=True)
            plt.show()

    def getRandomGenerator(self, coordRange: range):
        rand = self._RandomGenerator(coordRange, self)
        return rand

myGraph = WeightedTransitGraph()
gen = myGraph.getRandomGenerator((0,200))
gen.generateStopCoordinates(fakegen, 20, 20)
gen.generateRandomLine(5)
# print(gen)
# print(gen.stopList)
gen.plotStops()
print(myGraph.nodeList)
